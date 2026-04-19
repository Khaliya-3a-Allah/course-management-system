import {
  getAllProgress,
  getProgressById,
  createProgress,
  updateProgress,
  deleteProgress,
} from "../controllers/progress.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";
import {
  authenticateRequest,
  authorizeOwner,
} from "../middleware/authPlaceholder.js";

// GET /progress        — public
// GET /progress/:id    — public
// POST /progress       — authenticated
// PUT /progress/:id    — authenticated + must be owner
// DELETE /progress/:id — authenticated + must be owner
export const progressRouter = createCrudRouter(
  {
    getAll: getAllProgress,
    getById: getProgressById,
    create: createProgress,
    update: updateProgress,
    delete: deleteProgress,
  },
  {
    authMiddleware: [authenticateRequest],
    ownerMiddleware: [authorizeOwner("progress")],
  }
);
