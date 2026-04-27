import { buildCrudControllers } from "./crudFactory.js";
import SupportTicket from "../models/SupportTicket.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const supportTicketsController = buildCrudControllers("supportTickets");

export const getAllSupportTickets = supportTicketsController.getAll;
export const getSupportTicketById = supportTicketsController.getById;
export const createSupportTicket = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    requesterName = "",
    requesterEmail,
    topic = "Other",
    supportMode = "email",
    createdBy,
  } = req.body || {};

  if (!title || !description) {
    throw new ApiError(400, "title and description are required");
  }
  if (!["email", "live"].includes(supportMode)) {
    throw new ApiError(400, "supportMode must be email or live");
  }

  const userId = req.user?.id || createdBy || null;
  const user = userId ? await User.findById(userId).lean({ virtuals: true }) : null;
  const email = requesterEmail || user?.email || "";

  if (!email) {
    throw new ApiError(400, "requesterEmail is required for guest support tickets");
  }

  const ticket = await SupportTicket.create({
    title,
    description,
    requesterName: requesterName || user?.name || "",
    requesterEmail: email,
    topic,
    supportMode,
    userId,
    createdBy: userId,
    messages: [
      {
        senderRole: "user",
        senderName: requesterName || user?.name || "",
        senderEmail: email,
        body: description,
      },
    ],
  });

  res.status(201).json({ success: true, data: ticket });
});
export const updateSupportTicket = supportTicketsController.update;
export const deleteSupportTicket = supportTicketsController.delete;

function canReadTicket(ticket, { email, user }) {
  if (user?.role === "admin") return true;
  if (user?.id && String(ticket.userId || ticket.createdBy || "") === String(user.id)) return true;
  return email && String(ticket.requesterEmail).toLowerCase() === String(email).toLowerCase();
}

export const getSupportTicketMessages = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id).lean({ virtuals: true });
  if (!ticket) throw new ApiError(404, "Support ticket not found");

  if (!canReadTicket(ticket, { email: req.query.email, user: req.user })) {
    throw new ApiError(403, "You are not allowed to view this support chat");
  }

  res.status(200).json({
    success: true,
    data: {
      ticket: {
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        requesterEmail: ticket.requesterEmail,
        supportMode: ticket.supportMode,
      },
      messages: ticket.messages || [],
    },
  });
});

export const addSupportTicketMessage = asyncHandler(async (req, res) => {
  const { body, requesterName = "", requesterEmail } = req.body || {};
  if (!body || String(body).trim().length < 1) {
    throw new ApiError(400, "Message body is required");
  }

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) throw new ApiError(404, "Support ticket not found");

  if (!canReadTicket(ticket, { email: requesterEmail, user: req.user })) {
    throw new ApiError(403, "You are not allowed to reply to this support chat");
  }
  if (ticket.supportMode !== "live") {
    throw new ApiError(400, "This ticket is set to email support");
  }

  ticket.messages.push({
    senderRole: req.user?.role === "admin" ? "admin" : "user",
    senderName: req.user?.name || requesterName || ticket.requesterName,
    senderEmail: req.user?.email || requesterEmail || ticket.requesterEmail,
    body,
  });
  if (ticket.status === "open") ticket.status = "in-progress";
  await ticket.save();

  res.status(201).json({ success: true, data: ticket.messages[ticket.messages.length - 1] });
});
