import { listByUser, findById, create } from "../data/store.js";
import { buildCrudControllers } from "./crudFactory.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/User.js";

const base = buildCrudControllers("enrollments");

export async function getAllEnrollments(req, res) {
  const isAdmin = req.user.role === "admin";
  const userId = isAdmin && req.query.userId ? req.query.userId : req.user.id;
  const data = await listByUser("enrollments", userId);
  res.status(200).json({ success: true, count: data.length, data });
}

export async function getEnrollmentById(req, res) {
  const item = await findById("enrollments", req.params.id);
  if (!item) throw new ApiError(404, "Enrollment not found");
  if (req.user.role !== "admin" && String(item.userId) !== String(req.user.id)) {
    throw new ApiError(403, "Forbidden");
  }
  res.status(200).json({ success: true, data: item });
}

export async function createEnrollment(req, res) {
  const payload = { ...req.body, createdBy: req.user.id };
  const item = await create("enrollments", payload);
  if (!item) throw new ApiError(400, "Unable to create enrollment");

  await User.findByIdAndUpdate(req.user.id, {
    $addToSet: { enrolledCourseIds: item.courseId },
  });

  res.status(201).json({ success: true, data: item });
}

export const updateEnrollment = base.update;
export const deleteEnrollment = base.delete;
