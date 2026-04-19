import { list, listByUser, findById, create } from "../data/store.js";
import { buildCrudControllers } from "./crudFactory.js";
import { ApiError } from "../utils/ApiError.js";

const base = buildCrudControllers("purchases");

export async function getAllPurchases(req, res) {
  const data = req.query.userId
    ? await listByUser("purchases", req.query.userId)
    : await list("purchases");
  res.status(200).json({ success: true, count: data.length, data });
}

export const getPurchaseById = base.getById;

export async function createPurchase(req, res) {
  const { userId, courseId } = req.body || {};
  if (!userId || !courseId) {
    throw new ApiError(400, "userId and courseId are required");
  }

  const course = await findById("courses", courseId);
  if (!course) throw new ApiError(404, "Course not found");

  const amount = Number(course.price || 0);
  const payload = {
    userId,
    courseId,
    amount,
    status: "paid",
    createdBy: req.user?.id,
  };

  const item = await create("purchases", payload);
  res.status(201).json({ success: true, data: item });
}

export const updatePurchase = base.update;
export const deletePurchase = base.delete;
