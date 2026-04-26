import { Router } from "express";
import {
  changePassword,
  login,
  logout,
  me,
  register,
  requestPasswordChange,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controller.js";
import { sendCode, verifyCode } from "../controllers/emailVerification.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateRequest } from "../middleware/authPlaceholder.js";
import { createLimiter } from "../utils/rateLimiters.js";
import { twoFactorRouter } from "./twoFactor.routes.js";

const router = Router();

const registerLimiter = createLimiter();
const loginLimiter = createLimiter({ keyByEmail: true });
const verifyLimiter = createLimiter({ max: 10, windowMinutes: 15 });
const passwordLimiter = createLimiter({ max: 5, windowMinutes: 15, keyByEmail: true });

router.post("/register", registerLimiter, asyncHandler(register));
router.post("/login", loginLimiter, asyncHandler(login));
router.post("/password/forgot", passwordLimiter, asyncHandler(requestPasswordReset));
router.post("/password/reset", passwordLimiter, asyncHandler(resetPassword));
router.post("/forgot-password", passwordLimiter, asyncHandler(requestPasswordReset));
router.post("/reset-password", passwordLimiter, asyncHandler(resetPassword));
router.post("/verify-email", verifyLimiter, asyncHandler(verifyCode));
router.post("/resend-verification", verifyLimiter, asyncHandler(sendCode));
router.get("/me", authenticateRequest, asyncHandler(me));
router.post("/password/change/request", authenticateRequest, verifyLimiter, asyncHandler(requestPasswordChange));
router.post("/password/change", authenticateRequest, verifyLimiter, asyncHandler(changePassword));
router.post("/change-password/request", authenticateRequest, verifyLimiter, asyncHandler(requestPasswordChange));
router.post("/change-password", authenticateRequest, verifyLimiter, asyncHandler(changePassword));
router.post("/logout", authenticateRequest, asyncHandler(logout));
router.use("/2fa", twoFactorRouter);

export const authRouter = router;
