import { list, listByUser } from "../data/store.js";
import { buildCrudControllers } from "./crudFactory.js";
import { ApiError } from "../utils/ApiError.js";

const base = buildCrudControllers("enrollments");

export async function getAllEnrollments(req, res) {
  const data = req.query.userId
    ? await listByUser("enrollments", req.query.userId)
    : await list("enrollments");
  res.status(200).json({ success: true, count: data.length, data });
}

export const getEnrollmentById = base.getById;
export const createEnrollment = base.create;
export const updateEnrollment = base.update;
export const deleteEnrollment = base.delete;
