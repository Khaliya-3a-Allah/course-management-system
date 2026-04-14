import {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../controllers/lessons.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";

export const lessonsRouter = createCrudRouter({
  getAll: getAllLessons,
  getById: getLessonById,
  create: createLesson,
  update: updateLesson,
  delete: deleteLesson,
});
