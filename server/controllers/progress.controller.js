import { list, listByUser } from "../data/store.js";
import { buildCrudControllers } from "./crudFactory.js";

const base = buildCrudControllers("progress");

export async function getAllProgress(req, res) {
  const data = req.query.userId
    ? await listByUser("progress", req.query.userId)
    : await list("progress");
  res.status(200).json({ success: true, count: data.length, data });
}

export const getProgressById = base.getById;
export const createProgress = base.create;
export const updateProgress = base.update;
export const deleteProgress = base.delete;
