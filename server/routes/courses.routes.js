import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  searchCourses,
  getCourseSearchFacets,
  getCourseSearchAnalytics,
} from "../controllers/courses.controller.js";
import { Router } from "express";
import { createCrudRouter } from "../utils/createCrudRouter.js";
import {
  authenticateRequest,
  authorizeRoles,
  authorizeOwner,
} from "../middleware/authPlaceholder.js";

// GET /courses        — public
// GET /courses/:id    — public
// POST /courses       — authenticated (instructors/admins create courses)
// PUT /courses/:id    — authenticated + must be the course owner (instructorId)
// DELETE /courses/:id — authenticated + must be the course owner (instructorId)
const baseCrudRouter = createCrudRouter(
  {
    getAll: getAllCourses,
    getById: getCourseById,
    create: createCourse,
    update: updateCourse,
    delete: deleteCourse,
  },
  {
    authMiddleware: [authenticateRequest],
    ownerMiddleware: [authorizeOwner("courses", "instructorId")],
  }
);

export const coursesRouter = Router();

coursesRouter.get("/search", searchCourses);
coursesRouter.get("/search/facets", getCourseSearchFacets);
coursesRouter.get(
  "/search/analytics",
  authenticateRequest,
  authorizeRoles("admin"),
  getCourseSearchAnalytics
);
coursesRouter.use("/", baseCrudRouter);
