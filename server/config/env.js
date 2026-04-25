import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const NODE_ENV = process.env.NODE_ENV || "development";

if (NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET must be set in production. See .env.example");
}

export const env = {
  NODE_ENV,
  PORT: parseNumber(process.env.PORT, 5000),
  API_PREFIX: process.env.API_PREFIX || "/api/v1",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  ENABLE_REQUEST_LOGS: process.env.ENABLE_REQUEST_LOGS !== "false",
  MONGODB_URI: process.env.MONGODB_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || crypto.randomBytes(48).toString("hex"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_CHALLENGE_EXPIRES_IN: process.env.JWT_CHALLENGE_EXPIRES_IN || "5m",
  TOTP_ISSUER: process.env.TOTP_ISSUER || "Courseware",
  GMAIL_USER: process.env.GMAIL_USER || "",
  GMAIL_PASS: process.env.GMAIL_PASS || "",
};
