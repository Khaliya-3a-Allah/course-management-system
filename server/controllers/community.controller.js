import mongoose from "mongoose";
import Thread from "../models/Thread.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

function isModerator(user) {
  return ["admin", "instructor"].includes(user?.role);
}

function toObjectId(value, fieldName) {
  if (!value || !mongoose.isValidObjectId(value)) {
    throw new ApiError(400, `Invalid ${fieldName}`);
  }
  return new mongoose.Types.ObjectId(value);
}

function computeSpamScore(text = "") {
  const normalized = String(text).toLowerCase();
  let score = 0;

  const urlMatches = normalized.match(/https?:\/\//g) || [];
  if (urlMatches.length >= 2) score += 2;

  const suspiciousPhrases = [
    "free money",
    "crypto giveaway",
    "whatsapp",
    "telegram",
    "click here",
    "buy now",
  ];
  suspiciousPhrases.forEach((phrase) => {
    if (normalized.includes(phrase)) score += 1;
  });

  if (normalized.length > 0) {
    const upperRatio =
      normalized.replace(/[^a-z]/g, "").length /
      Math.max(normalized.replace(/[^a-zA-Z]/g, "").length, 1);
    if (upperRatio < 0.3 && /[A-Z]{12,}/.test(String(text))) {
      score += 1;
    }
  }

  if (/(.)\1{8,}/.test(normalized)) score += 1;
  if ((normalized.match(/!/g) || []).length >= 8) score += 1;

  return score;
}

async function adjustReputation(userId, delta, statField = null) {
  const update = {
    $inc: {
      reputationScore: delta,
    },
  };

  if (statField) {
    update.$inc[`communityStats.${statField}`] = 1;
  }

  await User.findByIdAndUpdate(userId, update);
}

export async function listThreads(req, res) {
  const {
    courseId,
    lessonId,
    status,
    q,
    page = 1,
    limit = 20,
  } = req.query;

  const filter = {};
  if (courseId) filter.courseId = toObjectId(courseId, "courseId");
  if (lessonId) filter.lessonId = toObjectId(lessonId, "lessonId");

  if (q) {
    filter.$or = [
      { title: { $regex: String(q), $options: "i" } },
      { body: { $regex: String(q), $options: "i" } },
    ];
  }

  if (isModerator(req.user)) {
    if (status) filter.status = status;
  } else {
    filter.status = "published";
  }

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const [items, total] = await Promise.all([
    Thread.find(filter)
      .populate("createdBy", "name role reputationScore")
      .sort({ isPinned: -1, lastActivityAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean({ virtuals: true }),
    Thread.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: items.length,
    total,
    page: pageNumber,
    data: items,
  });
}

export async function createThread(req, res) {
  const { courseId, lessonId = null, title, body, tags = [] } = req.body || {};

  if (!title || !body || !courseId) {
    throw new ApiError(400, "courseId, title, and body are required");
  }

  const spamScore = computeSpamScore(`${title}\n${body}`);
  const thread = await Thread.create({
    courseId: toObjectId(courseId, "courseId"),
    lessonId: lessonId ? toObjectId(lessonId, "lessonId") : null,
    title,
    body,
    tags: Array.isArray(tags) ? tags.slice(0, 8) : [],
    createdBy: toObjectId(req.user.id, "userId"),
    status: spamScore >= 3 ? "pending" : "published",
    moderationReason: spamScore >= 3 ? "Automated spam review" : "",
    spamScore,
    lastActivityAt: new Date(),
  });

  await adjustReputation(req.user.id, 2, "threadsCount");

  const populated = await Thread.findById(thread._id)
    .populate("createdBy", "name role reputationScore")
    .lean({ virtuals: true });

  res.status(201).json({ success: true, data: populated });
}

export async function getThreadById(req, res) {
  const { threadId } = req.params;
  if (!mongoose.isValidObjectId(threadId)) {
    throw new ApiError(400, "Invalid threadId");
  }

  const thread = await Thread.findById(threadId)
    .populate("createdBy", "name role reputationScore")
    .lean({ virtuals: true });

  if (!thread) {
    throw new ApiError(404, "Thread not found");
  }

  if (!isModerator(req.user) && thread.status !== "published") {
    throw new ApiError(403, "This thread is under moderation");
  }

  const commentFilter = { threadId };
  if (!isModerator(req.user)) commentFilter.status = "published";

  const comments = await Comment.find(commentFilter)
    .populate("createdBy", "name role reputationScore")
    .sort({ isAccepted: -1, upvotesCount: -1, createdAt: 1 })
    .lean({ virtuals: true });

  res.status(200).json({ success: true, data: { thread, comments } });
}

export async function addComment(req, res) {
  const { threadId } = req.params;
  const { body, parentCommentId = null } = req.body || {};

  if (!body) {
    throw new ApiError(400, "Comment body is required");
  }

  if (!mongoose.isValidObjectId(threadId)) {
    throw new ApiError(400, "Invalid threadId");
  }

  const thread = await Thread.findById(threadId);
  if (!thread) throw new ApiError(404, "Thread not found");
  if (thread.status === "locked") {
    throw new ApiError(400, "Thread is locked by moderation");
  }

  const spamScore = computeSpamScore(body);

  const comment = await Comment.create({
    threadId,
    parentCommentId: parentCommentId && mongoose.isValidObjectId(parentCommentId)
      ? parentCommentId
      : null,
    body,
    createdBy: toObjectId(req.user.id, "userId"),
    status: spamScore >= 3 ? "pending" : "published",
    moderationReason: spamScore >= 3 ? "Automated spam review" : "",
    spamScore,
  });

  thread.commentCount += 1;
  thread.lastActivityAt = new Date();
  await thread.save();

  await adjustReputation(req.user.id, 1, "commentsCount");

  const populated = await Comment.findById(comment._id)
    .populate("createdBy", "name role reputationScore")
    .lean({ virtuals: true });

  res.status(201).json({ success: true, data: populated });
}

export async function toggleThreadUpvote(req, res) {
  const { threadId } = req.params;
  if (!mongoose.isValidObjectId(threadId)) {
    throw new ApiError(400, "Invalid threadId");
  }

  const thread = await Thread.findById(threadId);
  if (!thread) throw new ApiError(404, "Thread not found");

  const userId = String(req.user.id);
  const existingIndex = thread.upvoteUserIds.findIndex((id) => String(id) === userId);

  let upvoted;
  if (existingIndex >= 0) {
    thread.upvoteUserIds.splice(existingIndex, 1);
    thread.upvotesCount = Math.max(0, thread.upvotesCount - 1);
    upvoted = false;
    await adjustReputation(thread.createdBy, -1);
  } else {
    thread.upvoteUserIds.push(userId);
    thread.upvotesCount += 1;
    upvoted = true;
    await adjustReputation(thread.createdBy, 1, "upvotesReceived");
  }

  await thread.save();

  res.status(200).json({
    success: true,
    data: {
      upvoted,
      upvotesCount: thread.upvotesCount,
    },
  });
}

export async function toggleCommentUpvote(req, res) {
  const { commentId } = req.params;
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  const userId = String(req.user.id);
  const existingIndex = comment.upvoteUserIds.findIndex((id) => String(id) === userId);

  let upvoted;
  if (existingIndex >= 0) {
    comment.upvoteUserIds.splice(existingIndex, 1);
    comment.upvotesCount = Math.max(0, comment.upvotesCount - 1);
    upvoted = false;
    await adjustReputation(comment.createdBy, -1);
  } else {
    comment.upvoteUserIds.push(userId);
    comment.upvotesCount += 1;
    upvoted = true;
    await adjustReputation(comment.createdBy, 1, "upvotesReceived");
  }

  await comment.save();

  res.status(200).json({
    success: true,
    data: {
      upvoted,
      upvotesCount: comment.upvotesCount,
    },
  });
}

export async function acceptAnswer(req, res) {
  const { commentId } = req.params;
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  const thread = await Thread.findById(comment.threadId);
  if (!thread) throw new ApiError(404, "Thread not found");

  const ownerId = String(thread.createdBy);
  const isOwner = ownerId === String(req.user.id);
  if (!isOwner && !isModerator(req.user)) {
    throw new ApiError(403, "Only the thread author or moderator can accept answers");
  }

  if (thread.acceptedCommentId && String(thread.acceptedCommentId) !== String(comment._id)) {
    const oldComment = await Comment.findById(thread.acceptedCommentId);
    if (oldComment) {
      oldComment.isAccepted = false;
      await oldComment.save();
      await adjustReputation(oldComment.createdBy, -12);
    }
  }

  comment.isAccepted = true;
  await comment.save();

  thread.acceptedCommentId = comment._id;
  thread.lastActivityAt = new Date();
  await thread.save();

  await adjustReputation(comment.createdBy, 12, "acceptedAnswers");

  res.status(200).json({
    success: true,
    data: {
      acceptedCommentId: String(comment._id),
      threadId: String(thread._id),
    },
  });
}

export async function getModerationQueue(req, res) {
  const [pendingThreads, pendingComments] = await Promise.all([
    Thread.find({ status: "pending" })
      .populate("createdBy", "name role")
      .sort({ spamScore: -1, createdAt: 1 })
      .lean({ virtuals: true }),
    Comment.find({ status: "pending" })
      .populate("createdBy", "name role")
      .populate("threadId", "title")
      .sort({ spamScore: -1, createdAt: 1 })
      .lean({ virtuals: true }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      threads: pendingThreads,
      comments: pendingComments,
    },
  });
}

export async function moderateThread(req, res) {
  const { threadId } = req.params;
  const { action, reason = "" } = req.body || {};
  if (!mongoose.isValidObjectId(threadId)) {
    throw new ApiError(400, "Invalid threadId");
  }

  const thread = await Thread.findById(threadId);
  if (!thread) throw new ApiError(404, "Thread not found");

  if (!["approve", "reject", "lock"].includes(action)) {
    throw new ApiError(400, "Action must be approve, reject, or lock");
  }

  thread.status = action === "approve" ? "published" : action === "reject" ? "rejected" : "locked";
  thread.moderationReason = reason;
  await thread.save();

  const updatedThread = await Thread.findById(thread._id)
    .populate("createdBy", "name role reputationScore")
    .lean({ virtuals: true });

  res.status(200).json({ success: true, data: updatedThread });
}

export async function moderateComment(req, res) {
  const { commentId } = req.params;
  const { action, reason = "" } = req.body || {};
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  if (!["approve", "reject"].includes(action)) {
    throw new ApiError(400, "Action must be approve or reject");
  }

  comment.status = action === "approve" ? "published" : "rejected";
  comment.moderationReason = reason;
  await comment.save();

  const updatedComment = await Comment.findById(comment._id)
    .populate("createdBy", "name role reputationScore")
    .lean({ virtuals: true });

  res.status(200).json({ success: true, data: updatedComment });
}
