import mongoose from "mongoose";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Thread from "../models/Thread.js";
import Comment from "../models/Comment.js";
import AbuseReport from "../models/AbuseReport.js";
import AuditLog from "../models/AuditLog.js";
import SupportTicket from "../models/SupportTicket.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { invalidateCachedResponses } from "../utils/responseCache.js";
import { sendSupportReplyEmail } from "../utils/mailer.js";

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "");
}

async function writeAudit(req, { action, targetType, targetId = null, summary = "", metadata = {} }) {
  await AuditLog.create({
    actorId: req.user?.id || null,
    actorEmail: req.user?.email || "",
    action,
    targetType,
    targetId: mongoose.isValidObjectId(targetId) ? targetId : null,
    summary,
    metadata,
    ipAddress: clientIp(req),
  });
}

function parseLimit(value, fallback = 25, max = 100) {
  return Math.min(max, Math.max(1, Number.parseInt(value, 10) || fallback));
}

function objectIdOrFail(value, label) {
  if (!mongoose.isValidObjectId(value)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
  return value;
}

function userRiskFlags(user) {
  const flags = [];
  if (!user.verified) flags.push("Email not verified");
  if (user.isDeleted) flags.push("Soft deleted");
  if (Number(user.reputationScore || 0) < 0) flags.push("Negative reputation");
  if (user.role === "admin") flags.push("Privileged account");
  return flags;
}

function courseRiskFlags(course) {
  const flags = [];
  if (course.isDeleted) flags.push("Soft deleted");
  if (!course.isPublished) flags.push("Unpublished");
  if (course.approvalStatus === "pending") flags.push("Needs approval");
  if (course.approvalStatus === "rejected") flags.push("Rejected");
  if (Number(course.price || 0) > 0 && !course.thumbnail) flags.push("Paid course missing thumbnail");
  return flags;
}

export const createAbuseReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason, details = "", severity = "medium" } = req.body || {};
  if (!targetType || !reason) {
    throw new ApiError(400, "targetType and reason are required");
  }

  const report = await AbuseReport.create({
    targetType,
    targetId: targetId && mongoose.isValidObjectId(targetId) ? targetId : null,
    reason,
    details,
    severity,
    reportedBy: req.user.id,
  });

  await writeAudit(req, {
    action: "report.created",
    targetType: "abuse-report",
    targetId: report._id,
    summary: `Report created for ${targetType}`,
    metadata: { targetType, targetId, severity },
  });

  res.status(201).json({ success: true, data: report });
});

export const getAdminOverview = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    deletedUsers,
    totalCourses,
    deletedCourses,
    pendingCourses,
    openReports,
    openSupportTickets,
    pendingThreads,
    pendingComments,
    recentAuditLogs,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isDeleted: true }),
    Course.countDocuments({}),
    Course.countDocuments({ isDeleted: true }),
    Course.countDocuments({ approvalStatus: "pending", isDeleted: { $ne: true } }),
    AbuseReport.countDocuments({ status: { $in: ["open", "reviewing"] } }),
    SupportTicket.countDocuments({ status: { $in: ["open", "in-progress"] } }),
    Thread.countDocuments({ status: "pending" }),
    Comment.countDocuments({ status: "pending" }),
    AuditLog.find({}).sort({ createdAt: -1 }).limit(8).lean({ virtuals: true }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalUsers,
        activeUsers: totalUsers - deletedUsers,
        deletedUsers,
        totalCourses,
        activeCourses: totalCourses - deletedCourses,
        deletedCourses,
        pendingCourses,
        openReports,
        openSupportTickets,
        pendingCommunityItems: pendingThreads + pendingComments,
      },
      recentAuditLogs,
    },
  });
});

export const listSupportTickets = asyncHandler(async (req, res) => {
  const limit = parseLimit(req.query.limit, 40, 100);
  const tickets = await SupportTicket.find({})
    .populate("userId", "name email role")
    .populate("repliedBy", "name email role")
    .sort({ status: 1, createdAt: -1 })
    .limit(limit)
    .lean({ virtuals: true });

  res.status(200).json({ success: true, count: tickets.length, data: tickets });
});

export const replyToSupportTicket = asyncHandler(async (req, res) => {
  const ticketId = objectIdOrFail(req.params.ticketId, "ticketId");
  const { body, status = "resolved" } = req.body || {};

  if (!body || String(body).trim().length < 5) {
    throw new ApiError(400, "Reply body must be at least 5 characters");
  }

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new ApiError(404, "Support ticket not found");
  if (!ticket.requesterEmail) {
    throw new ApiError(400, "This ticket has no requester email");
  }

  await sendSupportReplyEmail({
    toEmail: ticket.requesterEmail,
    requesterName: ticket.requesterName,
    subject: `Courseware support: ${ticket.title}`,
    message: body,
  });

  ticket.adminReply = body;
  ticket.status = status;
  ticket.repliedAt = new Date();
  ticket.repliedBy = req.user.id;
  ticket.emailSentAt = new Date();
  ticket.messages.push({
    senderRole: "admin",
    senderName: req.user.name,
    senderEmail: req.user.email,
    body,
  });
  await ticket.save();

  await writeAudit(req, {
    action: "support.reply_sent",
    targetType: "support-ticket",
    targetId: ticketId,
    summary: `Support reply sent to ${ticket.requesterEmail}`,
    metadata: { status },
  });

  res.status(200).json({ success: true, data: ticket });
});

export const addSupportChatMessage = asyncHandler(async (req, res) => {
  const ticketId = objectIdOrFail(req.params.ticketId, "ticketId");
  const { body } = req.body || {};
  if (!body || String(body).trim().length < 1) {
    throw new ApiError(400, "Message body is required");
  }

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new ApiError(404, "Support ticket not found");

  ticket.messages.push({
    senderRole: "admin",
    senderName: req.user.name,
    senderEmail: req.user.email,
    body,
  });
  ticket.status = "in-progress";
  await ticket.save();

  await writeAudit(req, {
    action: "support.chat_message_sent",
    targetType: "support-ticket",
    targetId: ticketId,
    summary: `Admin chat reply sent to ${ticket.requesterEmail}`,
  });

  res.status(201).json({ success: true, data: ticket.messages[ticket.messages.length - 1] });
});

export const listAdminUsers = asyncHandler(async (req, res) => {
  const limit = parseLimit(req.query.limit);
  const users = await User.find({})
    .select("-password -twoFactorSecret -verificationCode -passwordResetCode -passwordChangeCode")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean({ virtuals: true });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users.map((user) => ({ ...user, riskFlags: userRiskFlags(user) })),
  });
});

export const listAdminCourses = asyncHandler(async (req, res) => {
  const limit = parseLimit(req.query.limit);
  const courses = await Course.find({})
    .populate("instructorId", "name email role")
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean({ virtuals: true });

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses.map((course) => ({ ...course, riskFlags: courseRiskFlags(course) })),
  });
});

export const listReports = asyncHandler(async (req, res) => {
  const limit = parseLimit(req.query.limit);
  const reports = await AbuseReport.find({})
    .populate("reportedBy", "name email role")
    .populate("assignedTo", "name email role")
    .sort({ status: 1, severity: -1, createdAt: -1 })
    .limit(limit)
    .lean({ virtuals: true });

  res.status(200).json({ success: true, count: reports.length, data: reports });
});

export const listAuditLogs = asyncHandler(async (req, res) => {
  const limit = parseLimit(req.query.limit, 30, 150);
  const logs = await AuditLog.find({})
    .populate("actorId", "name email role")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean({ virtuals: true });

  res.status(200).json({ success: true, count: logs.length, data: logs });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const userId = objectIdOrFail(req.params.userId, "userId");
  const { role } = req.body || {};
  if (!["student", "instructor", "admin"].includes(role)) {
    throw new ApiError(400, "Role must be student, instructor, or admin");
  }

  const user = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true })
    .select("-password -twoFactorSecret")
    .lean({ virtuals: true });
  if (!user) throw new ApiError(404, "User not found");

  await writeAudit(req, {
    action: "user.role.updated",
    targetType: "user",
    targetId: userId,
    summary: `Role changed to ${role}`,
    metadata: { role },
  });

  res.status(200).json({ success: true, data: user });
});

export const softDeleteUser = asyncHandler(async (req, res) => {
  const userId = objectIdOrFail(req.params.userId, "userId");
  const { reason = "Admin soft delete" } = req.body || {};
  if (String(userId) === String(req.user.id)) {
    throw new ApiError(400, "Admins cannot soft-delete their own account");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true, deletedAt: new Date(), deletedBy: req.user.id, deletionReason: reason },
    { new: true }
  ).select("-password -twoFactorSecret");
  if (!user) throw new ApiError(404, "User not found");

  await writeAudit(req, {
    action: "user.soft_deleted",
    targetType: "user",
    targetId: userId,
    summary: reason,
  });

  res.status(200).json({ success: true, data: user });
});

export const restoreUser = asyncHandler(async (req, res) => {
  const userId = objectIdOrFail(req.params.userId, "userId");
  const user = await User.findByIdAndUpdate(
    userId,
    { isDeleted: false, deletedAt: null, deletedBy: null, deletionReason: "" },
    { new: true }
  ).select("-password -twoFactorSecret");
  if (!user) throw new ApiError(404, "User not found");

  await writeAudit(req, {
    action: "user.restored",
    targetType: "user",
    targetId: userId,
    summary: "User restored by admin",
  });

  res.status(200).json({ success: true, data: user });
});

export const approveCourse = asyncHandler(async (req, res) => {
  const courseId = objectIdOrFail(req.params.courseId, "courseId");
  const { publish = true } = req.body || {};
  const course = await Course.findByIdAndUpdate(
    courseId,
    {
      approvalStatus: "approved",
      isPublished: Boolean(publish),
      approvedAt: new Date(),
      approvedBy: req.user.id,
      rejectionReason: "",
    },
    { new: true, runValidators: true }
  );
  if (!course) throw new ApiError(404, "Course not found");
  invalidateCachedResponses(["courses:"]);

  await writeAudit(req, {
    action: "course.approved",
    targetType: "course",
    targetId: courseId,
    summary: publish ? "Course approved and published" : "Course approved",
  });

  res.status(200).json({ success: true, data: course });
});

export const rejectCourse = asyncHandler(async (req, res) => {
  const courseId = objectIdOrFail(req.params.courseId, "courseId");
  const { reason = "Rejected by admin" } = req.body || {};
  const course = await Course.findByIdAndUpdate(
    courseId,
    { approvalStatus: "rejected", isPublished: false, rejectionReason: reason },
    { new: true, runValidators: true }
  );
  if (!course) throw new ApiError(404, "Course not found");
  invalidateCachedResponses(["courses:"]);

  await writeAudit(req, {
    action: "course.rejected",
    targetType: "course",
    targetId: courseId,
    summary: reason,
  });

  res.status(200).json({ success: true, data: course });
});

export const softDeleteCourse = asyncHandler(async (req, res) => {
  const courseId = objectIdOrFail(req.params.courseId, "courseId");
  const { reason = "Admin soft delete" } = req.body || {};
  const course = await Course.findByIdAndUpdate(
    courseId,
    { isDeleted: true, isPublished: false, deletedAt: new Date(), deletedBy: req.user.id, deletionReason: reason },
    { new: true }
  );
  if (!course) throw new ApiError(404, "Course not found");
  invalidateCachedResponses(["courses:"]);

  await writeAudit(req, {
    action: "course.soft_deleted",
    targetType: "course",
    targetId: courseId,
    summary: reason,
  });

  res.status(200).json({ success: true, data: course });
});

export const restoreCourse = asyncHandler(async (req, res) => {
  const courseId = objectIdOrFail(req.params.courseId, "courseId");
  const course = await Course.findByIdAndUpdate(
    courseId,
    { isDeleted: false, deletedAt: null, deletedBy: null, deletionReason: "" },
    { new: true }
  );
  if (!course) throw new ApiError(404, "Course not found");
  invalidateCachedResponses(["courses:"]);

  await writeAudit(req, {
    action: "course.restored",
    targetType: "course",
    targetId: courseId,
    summary: "Course restored by admin",
  });

  res.status(200).json({ success: true, data: course });
});

export const resolveReport = asyncHandler(async (req, res) => {
  const reportId = objectIdOrFail(req.params.reportId, "reportId");
  const { status = "resolved", resolutionNote = "" } = req.body || {};
  if (!["reviewing", "resolved", "dismissed"].includes(status)) {
    throw new ApiError(400, "Status must be reviewing, resolved, or dismissed");
  }

  const report = await AbuseReport.findByIdAndUpdate(
    reportId,
    {
      status,
      assignedTo: req.user.id,
      resolutionNote,
      resolvedAt: ["resolved", "dismissed"].includes(status) ? new Date() : null,
    },
    { new: true, runValidators: true }
  );
  if (!report) throw new ApiError(404, "Report not found");

  await writeAudit(req, {
    action: "report.updated",
    targetType: "abuse-report",
    targetId: reportId,
    summary: `Report marked ${status}`,
    metadata: { status, resolutionNote },
  });

  res.status(200).json({ success: true, data: report });
});
