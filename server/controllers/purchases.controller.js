import { listByUser, findById, create } from "../data/store.js";
import { buildCrudControllers } from "./crudFactory.js";
import { ApiError } from "../utils/ApiError.js";

const base = buildCrudControllers("purchases");

export async function getAllPurchases(req, res) {
  const isAdmin = req.user.role === "admin";
  const userId = isAdmin && req.query.userId ? req.query.userId : req.user.id;
  const data = await listByUser("purchases", userId);
  res.status(200).json({ success: true, count: data.length, data });
}

export async function getPurchaseById(req, res) {
  const item = await findById("purchases", req.params.id);
  if (!item) throw new ApiError(404, "Purchase not found");
  if (req.user.role !== "admin" && String(item.userId) !== String(req.user.id)) {
    throw new ApiError(403, "Forbidden");
  }
  res.status(200).json({ success: true, data: item });
}

export async function createPurchase(req, res) {
  if (!req.user?.id) throw new ApiError(401, "Authentication required");

  const { courseId } = req.body || {};
  if (!courseId) {
    throw new ApiError(400, "courseId is required");
  }

  const course = await findById("courses", courseId);
  if (!course) throw new ApiError(404, "Course not found");

  const userId = req.user.id;
  const amount = Number(course.price || 0);
  const payload = {
    userId,
    courseId,
    amount,
    status: "paid",
    createdBy: userId,
  };

  try {
    const item = await create("purchases", payload);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, "You have already purchased this course");
    throw err;
  }
}

export const updatePurchase = base.update;
export const deletePurchase = base.delete;
