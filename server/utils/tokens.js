import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";

const CHALLENGE_PURPOSE = "2fa-pending";

export function signSessionToken(userId) {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function signChallengeToken(userId) {
  return jwt.sign(
    { id: userId, purpose: CHALLENGE_PURPOSE },
    env.JWT_SECRET,
    { expiresIn: env.JWT_CHALLENGE_EXPIRES_IN }
  );
}

// Verifies a 2FA challenge token issued at step 1 of login. Rejects any token
// missing the expected `purpose` claim so a full session token can never
// satisfy a 2FA step (or vice-versa).
export function verifyChallengeToken(token) {
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired 2FA challenge. Please sign in again.");
  }
  if (decoded?.purpose !== CHALLENGE_PURPOSE) {
    throw new ApiError(401, "Invalid 2FA challenge token.");
  }
  return decoded;
}
