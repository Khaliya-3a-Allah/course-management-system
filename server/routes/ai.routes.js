import { Router } from "express";
import { getCourseSuggestion } from "../controllers/ai.controller.js";
import { createLimiter } from "../utils/rateLimiters.js";

export const aiRouter = Router();

const aiLimiter = createLimiter({ windowMinutes: 10, max: 20 });

aiRouter.post("/course-suggestions", aiLimiter, getCourseSuggestion);
