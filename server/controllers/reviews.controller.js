import { buildCrudControllers } from "./crudFactory.js";

const reviewsController = buildCrudControllers("reviews");

export const getAllReviews = reviewsController.getAll;
export const getReviewById = reviewsController.getById;
export const createReview = reviewsController.create;
export const updateReview = reviewsController.update;
export const deleteReview = reviewsController.delete;
