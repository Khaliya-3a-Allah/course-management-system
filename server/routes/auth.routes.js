import { Router } from "express";
import { login, logout, me, register } from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateRequest } from "../middleware/authPlaceholder.js";
import { createLimiter } from "../utils/rateLimiters.js";
import { twoFactorRouter } from "./twoFactor.routes.js";

const router = Router();

const registerLimiter = createLimiter();
const loginLimiter = createLimiter({ keyByEmail: true });

router.post("/register", registerLimiter, asyncHandler(register));
router.post("/login", loginLimiter, asyncHandler(login));
router.get("/me", authenticateRequest, asyncHandler(me));
router.post("/logout", authenticateRequest, asyncHandler(logout));
router.use("/2fa", twoFactorRouter);

export const authRouter = router;
