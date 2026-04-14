import dotenv from "dotenv";

dotenv.config();

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseNumber(process.env.PORT, 5000),
  API_PREFIX: process.env.API_PREFIX || "/api/v1",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  ENABLE_REQUEST_LOGS: process.env.ENABLE_REQUEST_LOGS !== "false",
};
