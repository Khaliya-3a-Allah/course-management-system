import { buildCrudControllers } from "./crudFactory.js";

const enrollmentsController = buildCrudControllers("enrollments");

export const getAllEnrollments = enrollmentsController.getAll;
export const getEnrollmentById = enrollmentsController.getById;
export const createEnrollment = enrollmentsController.create;
export const updateEnrollment = enrollmentsController.update;
export const deleteEnrollment = enrollmentsController.delete;
