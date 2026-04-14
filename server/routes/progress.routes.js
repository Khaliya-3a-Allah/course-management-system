import {
  getAllProgress,
  getProgressById,
  createProgress,
  updateProgress,
  deleteProgress,
} from "../controllers/progress.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";

export const progressRouter = createCrudRouter({
  getAll: getAllProgress,
  getById: getProgressById,
  create: createProgress,
  update: updateProgress,
  delete: deleteProgress,
});
