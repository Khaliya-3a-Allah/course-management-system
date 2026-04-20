import rateLimit from "express-rate-limit";

export function createLimiter({ windowMinutes = 15, max = 10, keyByEmail = false } = {}) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: max,
    keyGenerator: keyByEmail
      ? (req) => `${req.ip}:${String(req.body?.email || "").toLowerCase()}`
      : (req) => req.ip,
    message: { success: false, message: "Too many attempts. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });
}
