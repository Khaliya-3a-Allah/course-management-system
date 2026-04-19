import {
  getAllSupportTickets,
  getSupportTicketById,
  createSupportTicket,
  updateSupportTicket,
  deleteSupportTicket,
} from "../controllers/supportTickets.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";
import {
  authenticateRequest,
  authorizeOwner,
} from "../middleware/authPlaceholder.js";

// GET /support-tickets        — public
// GET /support-tickets/:id    — public
// POST /support-tickets       — authenticated
// PUT /support-tickets/:id    — authenticated + must be creator
// DELETE /support-tickets/:id — authenticated + must be creator
export const supportTicketsRouter = createCrudRouter(
  {
    getAll: getAllSupportTickets,
    getById: getSupportTicketById,
    create: createSupportTicket,
    update: updateSupportTicket,
    delete: deleteSupportTicket,
  },
  {
    authMiddleware: [authenticateRequest],
    ownerMiddleware: [authorizeOwner("supportTickets")],
  }
);
