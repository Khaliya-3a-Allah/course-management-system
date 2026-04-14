import {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
} from "../controllers/modules.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";

export const modulesRouter = createCrudRouter({
  getAll: getAllModules,
  getById: getModuleById,
  create: createModule,
  update: updateModule,
  delete: deleteModule,
});
