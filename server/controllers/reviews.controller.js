import { list, listByUser, create, update, findById } from "../data/store.js";
import { buildCrudControllers } from "./crudFactory.js";
import { ApiError } from "../utils/ApiError.js";
import Review from "../models/Review.js";
import Course from "../models/Course.js";

const base = buildCrudControllers("reviews");

async function recalcCourseRating(courseId) {
  if (!courseId) return;
  const reviews = await Review.find({ courseId });
  const count = reviews.length;
  const avg = count > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
    : 0;
  await Course.findByIdAndUpdate(courseId, {
    rating: Math.round(avg * 10) / 10,
    reviewCount: count,
  });
}

export async function getAllReviews(req, res) {
  const data = req.query.userId
    ? await listByUser("reviews", req.query.userId)
    : await list("reviews");
  res.status(200).json({ success: true, count: data.length, data });
}

export async function createReview(req, res) {
  const payload = {
    ...req.body,
    userId: req.user.id,
    createdBy: req.user.id,
  };
  const item = await create("reviews", payload);
  if (!item) throw new ApiError(400, "Unable to create review with provided data");
  await recalcCourseRating(item.courseId);
  res.status(201).json({ success: true, data: item });
}

export async function updateReview(req, res) {
  const item = await update("reviews", req.params.id, req.body || {});
  if (!item) throw new ApiError(404, "Review not found");
  await recalcCourseRating(item.courseId);
  res.status(200).json({ success: true, data: item });
}

export const getReviewById = base.getById;
export const deleteReview = base.delete;
