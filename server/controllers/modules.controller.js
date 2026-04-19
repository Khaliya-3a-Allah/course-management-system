import { buildCrudControllers } from "./crudFactory.js";

const modulesController = buildCrudControllers("modules");

export const getAllModules = modulesController.getAll;
export const getModuleById = modulesController.getById;
export const createModule = modulesController.create;
export const updateModule = modulesController.update;
export const deleteModule = modulesController.delete;
