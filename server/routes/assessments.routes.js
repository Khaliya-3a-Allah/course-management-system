import { Router } from "express";
import {
  listLessonAttempts,
  submitLessonAttempt,
} from "../controllers/assessments.controller.js";
import { authenticateRequest } from "../middleware/authPlaceholder.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/lessons/:lessonId/attempts",
  authenticateRequest,
  asyncHandler(listLessonAttempts)
);

router.post(
  "/lessons/:lessonId/attempts",
  authenticateRequest,
  asyncHandler(submitLessonAttempt)
);

export const assessmentsRouter = router;
