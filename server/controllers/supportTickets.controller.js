import { buildCrudControllers } from "./crudFactory.js";

const supportTicketsController = buildCrudControllers("supportTickets");

export const getAllSupportTickets = supportTicketsController.getAll;
export const getSupportTicketById = supportTicketsController.getById;
export const createSupportTicket = supportTicketsController.create;
export const updateSupportTicket = supportTicketsController.update;
export const deleteSupportTicket = supportTicketsController.delete;
