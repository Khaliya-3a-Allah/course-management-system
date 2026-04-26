import { Router } from "express";
import {
  getAllSupportTickets,
  getSupportTicketById,
  createSupportTicket,
  updateSupportTicket,
  deleteSupportTicket,
  getSupportTicketMessages,
  addSupportTicketMessage,
} from "../controllers/supportTickets.controller.js";
import {
  authenticateRequest,
  authorizeOwner,
} from "../middleware/authPlaceholder.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Public ticket submission. Admin review happens through /admin/support-tickets.
router.post("/", asyncHandler(createSupportTicket));
router.get("/:id/messages", asyncHandler(getSupportTicketMessages));
router.post("/:id/messages", asyncHandler(addSupportTicketMessage));

router.get("/", asyncHandler(getAllSupportTickets));
router.get("/:id", asyncHandler(getSupportTicketById));
router.put("/:id", authenticateRequest, authorizeOwner("supportTickets"), asyncHandler(updateSupportTicket));
router.delete("/:id", authenticateRequest, authorizeOwner("supportTickets"), asyncHandler(deleteSupportTicket));

export { router as supportTicketsRouter };
