import { Router } from "express";
import {
  createAbuseReport,
  getAdminOverview,
  listAdminUsers,
  listAdminCourses,
  listReports,
  listAuditLogs,
  updateUserRole,
  softDeleteUser,
  restoreUser,
  approveCourse,
  rejectCourse,
  softDeleteCourse,
  restoreCourse,
  resolveReport,
} from "../controllers/admin.controller.js";
import { authenticateRequest, authorizeRoles } from "../middleware/authPlaceholder.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/reports", authenticateRequest, asyncHandler(createAbuseReport));

router.use(authenticateRequest, authorizeRoles("admin"));

router.get("/overview", getAdminOverview);
router.get("/users", listAdminUsers);
router.get("/courses", listAdminCourses);
router.get("/reports", listReports);
router.get("/audit-logs", listAuditLogs);

router.patch("/users/:userId/role", updateUserRole);
router.post("/users/:userId/soft-delete", softDeleteUser);
router.post("/users/:userId/restore", restoreUser);

router.post("/courses/:courseId/approve", approveCourse);
router.post("/courses/:courseId/reject", rejectCourse);
router.post("/courses/:courseId/soft-delete", softDeleteCourse);
router.post("/courses/:courseId/restore", restoreCourse);

router.patch("/reports/:reportId", resolveReport);

export { router as adminRouter };
