import {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
} from "../controllers/enrollments.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";
import {
  authenticateRequest,
  authorizeOwner,
} from "../middleware/authPlaceholder.js";

// GET /enrollments        — authenticated
// GET /enrollments/:id    — authenticated
// POST /enrollments       — authenticated
// PUT /enrollments/:id    — authenticated + must be owner
// DELETE /enrollments/:id — authenticated + must be owner
export const enrollmentsRouter = createCrudRouter(
  {
    getAll: getAllEnrollments,
    getById: getEnrollmentById,
    create: createEnrollment,
    update: updateEnrollment,
    delete: deleteEnrollment,
  },
  {
    readMiddleware: [authenticateRequest],
    authMiddleware: [authenticateRequest],
    ownerMiddleware: [authorizeOwner("enrollments")],
  }
);
