import {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviews.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";
import {
  authenticateRequest,
  authorizeOwner,
} from "../middleware/authPlaceholder.js";

// GET /reviews        — public
// GET /reviews/:id    — public
// POST /reviews       — authenticated
// PUT /reviews/:id    — authenticated + must be review author
// DELETE /reviews/:id — authenticated + must be review author
export const reviewsRouter = createCrudRouter(
  {
    getAll: getAllReviews,
    getById: getReviewById,
    create: createReview,
    update: updateReview,
    delete: deleteReview,
  },
  {
    authMiddleware: [authenticateRequest],
    ownerMiddleware: [authorizeOwner("reviews")],
  }
);
