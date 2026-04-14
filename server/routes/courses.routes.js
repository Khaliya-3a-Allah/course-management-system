import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courses.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";

export const coursesRouter = createCrudRouter({
  getAll: getAllCourses,
  getById: getCourseById,
  create: createCourse,
  update: updateCourse,
  delete: deleteCourse,
});
