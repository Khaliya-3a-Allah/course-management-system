import { Router } from "express";
import {
  setup2FA,
  enable2FA,
  verify2FA,
  disable2FA,
} from "../controllers/twoFactor.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateRequest } from "../middleware/authPlaceholder.js";

const router = Router();

// Setup and enable happen from a fully-authenticated session.
router.post("/setup", authenticateRequest, asyncHandler(setup2FA));
router.post("/enable", authenticateRequest, asyncHandler(enable2FA));
router.post("/disable", authenticateRequest, asyncHandler(disable2FA));

// Verify is the second step of login — authorized by a purpose-scoped
// challenge JWT, validated inside the controller.
router.post("/verify", asyncHandler(verify2FA));

export const twoFactorRouter = router;
