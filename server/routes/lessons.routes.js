import {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../controllers/lessons.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";
import {
  authenticateRequest,
  authorizeOwner,
} from "../middleware/authPlaceholder.js";

// GET /lessons        — public
// GET /lessons/:id    — public
// POST /lessons       — authenticated
// PUT /lessons/:id    — authenticated + must be creator
// DELETE /lessons/:id — authenticated + must be creator
export const lessonsRouter = createCrudRouter(
  {
    getAll: getAllLessons,
    getById: getLessonById,
    create: createLesson,
    update: updateLesson,
    delete: deleteLesson,
  },
  {
    authMiddleware: [authenticateRequest],
    ownerMiddleware: [authorizeOwner("lessons")],
  }
);
