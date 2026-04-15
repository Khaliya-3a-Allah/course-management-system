import speakeasy from "speakeasy";
import { env } from "../config/env.js";

// Wraps speakeasy so controllers stay free of library internals. A `window`
// of 1 tolerates ±30 s of clock drift between the server and the user's
// authenticator app — the RFC 6238 recommended default.
const VERIFY_WINDOW = 1;

export function generateTotpSecret(accountLabel) {
  const secret = speakeasy.generateSecret({
    length: 20,
    name: `${env.TOTP_ISSUER}:${accountLabel}`,
    issuer: env.TOTP_ISSUER,
  });
  return {
    base32: secret.base32,
    otpauthUrl: secret.otpauth_url,
  };
}

export function verifyTotpCode(base32Secret, code) {
  if (!base32Secret || !code) return false;
  return speakeasy.totp.verify({
    secret: base32Secret,
    encoding: "base32",
    token: String(code).trim(),
    window: VERIFY_WINDOW,
  });
}
