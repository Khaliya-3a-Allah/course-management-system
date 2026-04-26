import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";
import Purchase from "../models/Purchase.js";
import Progress from "../models/Progress.js";
import Review from "../models/Review.js";
import Certificate from "../models/Certificate.js";
import SupportTicket from "../models/SupportTicket.js";
import Thread from "../models/Thread.js";
import Comment from "../models/Comment.js";
import AssessmentAttempt from "../models/AssessmentAttempt.js";
import AuditLog from "../models/AuditLog.js";
import AbuseReport from "../models/AbuseReport.js";

// Maps resource name strings to their Mongoose models
const modelMap = {
  users: User,
  courses: Course,
  modules: Module,
  lessons: Lesson,
  enrollments: Enrollment,
  purchases: Purchase,
  progress: Progress,
  reviews: Review,
  certificates: Certificate,
  supportTickets: SupportTicket,
  threads: Thread,
  comments: Comment,
  assessmentAttempts: AssessmentAttempt,
  auditLogs: AuditLog,
  abuseReports: AbuseReport,
};

function getModel(resourceName) {
  const Model = modelMap[resourceName];
  if (!Model) throw new Error(`Unknown resource: ${resourceName}`);
  return Model;
}

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function withId(doc) {
  if (!doc) return doc;
  if (!doc.id) doc.id = doc._id?.toString();
  return doc;
}

function withIdList(docs) {
  return docs.map(withId);
}

// Return all documents for a resource
export async function list(resourceName) {
  const Model = getModel(resourceName);
  return withIdList(await Model.find({}).lean({ virtuals: true }));
}

// Return documents for a resource filtered by userId
export async function listByUser(resourceName, userId) {
  if (!isValidId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  const Model = getModel(resourceName);
  return withIdList(await Model.find({ userId }).lean({ virtuals: true }));
}

// Return a single document by id (returns null for invalid or missing ids)
export async function findById(resourceName, id) {
  if (!isValidId(id)) return null;
  const Model = getModel(resourceName);
  return withId(await Model.findById(id).lean({ virtuals: true }));
}

// Create a new document and return it (without the password field for users)
export async function create(resourceName, payload) {
  const Model = getModel(resourceName);
  const doc = await Model.create(payload);
  // Re-fetch so select:false fields (like password) are excluded from the response
  return withId(await Model.findById(doc._id).lean({ virtuals: true }));
}

// Update a document by id and return the updated version (null if not found)
export async function update(resourceName, id, payload) {
  if (!isValidId(id)) return null;
  const Model = getModel(resourceName);
  // Strip id fields from payload to avoid overwrite errors
  const { _id, id: _id2, ...safePayload } = payload;
  void _id;
  void _id2;
  return withId(await Model.findByIdAndUpdate(id, safePayload, {
    new: true,
    runValidators: true,
  }).lean({ virtuals: true }));
}

// Delete a document by id and return the deleted document (null if not found)
export async function remove(resourceName, id) {
  if (!isValidId(id)) return null;
  const Model = getModel(resourceName);
  return withId(await Model.findByIdAndDelete(id).lean({ virtuals: true }));
}
