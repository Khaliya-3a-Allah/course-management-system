import { Router } from "express";
import { login, logout, me, register } from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateRequest } from "../middleware/authPlaceholder.js";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", authenticateRequest, asyncHandler(me));
router.post("/logout", authenticateRequest, asyncHandler(logout));

export const authRouter = router;
