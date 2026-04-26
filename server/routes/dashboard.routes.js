import { Router } from "express";
import { authenticateRequest } from "../middleware/authPlaceholder.js";
import { getMyDashboard } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/me", authenticateRequest, getMyDashboard);

export const dashboardRouter = router;
