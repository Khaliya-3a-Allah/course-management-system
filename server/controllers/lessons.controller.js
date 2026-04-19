import { buildCrudControllers } from "./crudFactory.js";

const lessonsController = buildCrudControllers("lessons");

export const getAllLessons = lessonsController.getAll;
export const getLessonById = lessonsController.getById;
export const createLesson = lessonsController.create;
export const updateLesson = lessonsController.update;
export const deleteLesson = lessonsController.delete;
