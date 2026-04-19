import { buildCrudControllers } from "./crudFactory.js";

const coursesController = buildCrudControllers("courses");

export const getAllCourses = coursesController.getAll;
export const getCourseById = coursesController.getById;
export const createCourse = coursesController.create;
export const updateCourse = coursesController.update;
export const deleteCourse = coursesController.delete;
