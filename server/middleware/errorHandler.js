import { env } from "../config/env.js";

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  const payload = {
    success: false,
    message: error.message || "Internal Server Error",
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (env.NODE_ENV !== "production") {
    payload.stack = error.stack;
  }

  res.status(statusCode).json(payload);
}
