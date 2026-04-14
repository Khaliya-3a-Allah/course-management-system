import {
  getAllSupportTickets,
  getSupportTicketById,
  createSupportTicket,
  updateSupportTicket,
  deleteSupportTicket,
} from "../controllers/supportTickets.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";

export const supportTicketsRouter = createCrudRouter({
  getAll: getAllSupportTickets,
  getById: getSupportTicketById,
  create: createSupportTicket,
  update: updateSupportTicket,
  delete: deleteSupportTicket,
});
