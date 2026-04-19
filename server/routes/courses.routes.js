import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courses.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";
import {
  authenticateRequest,
  authorizeOwner,
} from "../middleware/authPlaceholder.js";

// GET /courses        — public
// GET /courses/:id    — public
// POST /courses       — authenticated (instructors/admins create courses)
// PUT /courses/:id    — authenticated + must be the course owner (instructorId)
// DELETE /courses/:id — authenticated + must be the course owner (instructorId)
export const coursesRouter = createCrudRouter(
  {
    getAll: getAllCourses,
    getById: getCourseById,
    create: createCourse,
    update: updateCourse,
    delete: deleteCourse,
  },
  {
    authMiddleware: [authenticateRequest],
    ownerMiddleware: [authorizeOwner("courses", "instructorId")],
  }
);
