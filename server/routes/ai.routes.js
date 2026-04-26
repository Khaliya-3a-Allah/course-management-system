import { Router } from "express";
import {
  generateLessonQuiz,
  getCourseSuggestion,
} from "../controllers/ai.controller.js";
import { createLimiter } from "../utils/rateLimiters.js";
import { authenticateRequest } from "../middleware/authPlaceholder.js";

export const aiRouter = Router();

const aiLimiter = createLimiter({ windowMinutes: 10, max: 20 });

aiRouter.post("/course-suggestions", aiLimiter, getCourseSuggestion);
aiRouter.post("/generate-quiz", authenticateRequest, aiLimiter, generateLessonQuiz);
