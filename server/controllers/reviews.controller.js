import { list, listByUser } from "../data/store.js";
import { buildCrudControllers } from "./crudFactory.js";

const base = buildCrudControllers("reviews");

export async function getAllReviews(req, res) {
  const data = req.query.userId
    ? await listByUser("reviews", req.query.userId)
    : await list("reviews");
  res.status(200).json({ success: true, count: data.length, data });
}

export const getReviewById = base.getById;
export const createReview = base.create;
export const updateReview = base.update;
export const deleteReview = base.delete;
