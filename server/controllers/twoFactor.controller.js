import bcrypt from "bcrypt";
import User from "../models/User.js";
import { findById } from "../data/store.js";
import { ApiError } from "../utils/ApiError.js";
import { generateTotpSecret, verifyTotpCode } from "../utils/totp.js";
import { signSessionToken, verifyChallengeToken } from "../utils/tokens.js";

// POST /auth/2fa/setup
// Generates a fresh TOTP secret and stores it on the user (still inactive).
// Returns the secret + otpauth URL once, so the client can render the QR.
export async function setup2FA(req, res) {
  const user = await User.findById(req.user.id)
    .select("+twoFactorSecret")
    .lean({ virtuals: true });
  if (!user) throw new ApiError(404, "User not found");

  if (user.twoFactorEnabled) {
    throw new ApiError(
      400,
      "Two-factor authentication is already enabled. Disable it before setting up a new secret."
    );
  }

  const { base32, otpauthUrl } = generateTotpSecret(user.email);

  await User.findByIdAndUpdate(req.user.id, {
    twoFactorSecret: base32,
    twoFactorEnabled: false,
  });

  res.status(200).json({
    success: true,
    data: { otpauthUrl, secret: base32 },
  });
}

// POST /auth/2fa/enable
// Verifies the current TOTP code against the saved (pending) secret. Only on
// success does twoFactorEnabled flip to true.
export async function enable2FA(req, res) {
  const { code } = req.body || {};
  if (!code) throw new ApiError(400, "Verification code is required.");

  const user = await User.findById(req.user.id)
    .select("+twoFactorSecret")
    .lean({ virtuals: true });
  if (!user) throw new ApiError(404, "User not found");

  if (user.twoFactorEnabled) {
    throw new ApiError(400, "Two-factor authentication is already enabled.");
  }
  if (!user.twoFactorSecret) {
    throw new ApiError(
      400,
      "Run /auth/2fa/setup first to generate a secret before enabling."
    );
  }

  const ok = verifyTotpCode(user.twoFactorSecret, code);
  if (!ok) {
    throw new ApiError(400, "Invalid verification code. Please try again.");
  }

  await User.findByIdAndUpdate(req.user.id, { twoFactorEnabled: true });

  res.status(200).json({
    success: true,
    message: "Two-factor authentication enabled.",
  });
}

// POST /auth/2fa/verify
// Step 2 of the login flow. Consumes the short-lived challenge JWT issued
// during step 1, verifies the TOTP code, and — on success — issues the real
// session token.
export async function verify2FA(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "2FA challenge token is required.");
  }
  const challengeToken = authHeader.split(" ")[1];
  const decoded = verifyChallengeToken(challengeToken);

  const { code } = req.body || {};
  if (!code) throw new ApiError(400, "Verification code is required.");

  const user = await User.findById(decoded.id)
    .select("+twoFactorSecret")
    .lean({ virtuals: true });
  if (!user) throw new ApiError(401, "User no longer exists.");

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new ApiError(
      400,
      "Two-factor authentication is not enabled for this account."
    );
  }

  const ok = verifyTotpCode(user.twoFactorSecret, code);
  if (!ok) {
    throw new ApiError(401, "Invalid verification code.");
  }

  const token = signSessionToken(user.id);
  // Re-fetch without the secret so the response matches the regular login shape.
  const safeUser = await findById("users", user.id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    data: safeUser,
  });
}

// POST /auth/2fa/disable
// Re-verifies the user's password AND a current TOTP code before clearing
// the secret. Requires a fully authenticated session (not a challenge token).
export async function disable2FA(req, res) {
  const { password, code } = req.body || {};
  if (!password || !code) {
    throw new ApiError(400, "Password and verification code are required.");
  }

  const user = await User.findById(req.user.id)
    .select("+password +twoFactorSecret")
    .lean({ virtuals: true });
  if (!user) throw new ApiError(404, "User not found");

  if (!user.twoFactorEnabled) {
    throw new ApiError(400, "Two-factor authentication is not enabled.");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid password.");
  }

  const codeMatches = verifyTotpCode(user.twoFactorSecret, code);
  if (!codeMatches) {
    throw new ApiError(401, "Invalid verification code.");
  }

  await User.findByIdAndUpdate(req.user.id, {
    twoFactorEnabled: false,
    twoFactorSecret: "",
  });

  res.status(200).json({
    success: true,
    message: "Two-factor authentication disabled.",
  });
}
