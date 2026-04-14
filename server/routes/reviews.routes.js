import {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviews.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";

export const reviewsRouter = createCrudRouter({
  getAll: getAllReviews,
  getById: getReviewById,
  create: createReview,
  update: updateReview,
  delete: deleteReview,
});
