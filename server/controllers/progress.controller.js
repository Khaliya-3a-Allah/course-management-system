import { buildCrudControllers } from "./crudFactory.js";

const progressController = buildCrudControllers("progress");

export const getAllProgress = progressController.getAll;
export const getProgressById = progressController.getById;
export const createProgress = progressController.create;
export const updateProgress = progressController.update;
export const deleteProgress = progressController.delete;
