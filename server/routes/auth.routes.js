import { Router } from "express";
import { login, logout, me, register } from "../controllers/auth.controller.js";
import { sendCode, verifyCode } from "../controllers/emailVerification.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateRequest } from "../middleware/authPlaceholder.js";
import { createLimiter } from "../utils/rateLimiters.js";
import { twoFactorRouter } from "./twoFactor.routes.js";

const router = Router();

const registerLimiter = createLimiter();
const loginLimiter = createLimiter({ keyByEmail: true });
const verifyLimiter = createLimiter({ max: 10, windowMinutes: 15 });

router.post("/register", registerLimiter, asyncHandler(register));
router.post("/login", loginLimiter, asyncHandler(login));
router.post("/verify-email", verifyLimiter, asyncHandler(verifyCode));
router.post("/resend-verification", verifyLimiter, asyncHandler(sendCode));
router.get("/me", authenticateRequest, asyncHandler(me));
router.post("/logout", authenticateRequest, asyncHandler(logout));
router.use("/2fa", twoFactorRouter);

export const authRouter = router;
