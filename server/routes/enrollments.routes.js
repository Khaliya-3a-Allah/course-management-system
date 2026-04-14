import {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
} from "../controllers/enrollments.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";

export const enrollmentsRouter = createCrudRouter({
  getAll: getAllEnrollments,
  getById: getEnrollmentById,
  create: createEnrollment,
  update: updateEnrollment,
  delete: deleteEnrollment,
});
