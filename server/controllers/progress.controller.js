import { listByUser, findById } from "../data/store.js";
import { buildCrudControllers } from "./crudFactory.js";
import { ApiError } from "../utils/ApiError.js";

const base = buildCrudControllers("progress");

export async function getAllProgress(req, res) {
  const isAdmin = req.user.role === "admin";
  const userId = isAdmin && req.query.userId ? req.query.userId : req.user.id;
  const data = await listByUser("progress", userId);
  res.status(200).json({ success: true, count: data.length, data });
}

export async function getProgressById(req, res) {
  const item = await findById("progress", req.params.id);
  if (!item) throw new ApiError(404, "Progress record not found");
  if (req.user.role !== "admin" && String(item.userId) !== String(req.user.id)) {
    throw new ApiError(403, "Forbidden");
  }
  res.status(200).json({ success: true, data: item });
}

export const createProgress = base.create;
export const updateProgress = base.update;
export const deleteProgress = base.delete;
