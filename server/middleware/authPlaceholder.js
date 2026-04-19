import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { findById } from "../data/store.js";

// Verifies the JWT from the Authorization header and attaches req.user.
// Protected routes must list this middleware before their controller.
export const authenticateRequest = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required. Please log in.");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired token. Please log in again.");
  }

  const user = await findById("users", decoded.id);
  if (!user) {
    throw new ApiError(401, "User no longer exists.");
  }

  req.user = user;
  next();
});

// Restricts access to users whose role is in the allowedRoles list.
// Must be used after authenticateRequest.
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action."
      );
    }
    next();
  };
}

// Ensures the logged-in user is the owner of the resource they are modifying.
// ownerField is the field on the document that stores the owner's user id.
// Use 'instructorId' for courses; 'createdBy' for everything else.
export function authorizeOwner(resourceName, ownerField = "createdBy") {
  return asyncHandler(async (req, res, next) => {
    const item = await findById(resourceName, req.params.id);
    if (!item) {
      throw new ApiError(404, `${resourceName} not found`);
    }

    const ownerId = item[ownerField]?.toString();
    if (!ownerId || ownerId !== req.user.id.toString()) {
      throw new ApiError(
        403,
        "You are not authorized to modify this resource."
      );
    }
    next();
  });
}
