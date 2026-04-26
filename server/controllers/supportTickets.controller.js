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
    createdBy,
  } = req.body || {};

  if (!title || !description) {
    throw new ApiError(400, "title and description are required");
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
    userId,
    createdBy: userId,
  });

  res.status(201).json({ success: true, data: ticket });
});
export const updateSupportTicket = supportTicketsController.update;
export const deleteSupportTicket = supportTicketsController.delete;
