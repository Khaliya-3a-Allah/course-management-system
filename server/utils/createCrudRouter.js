import { Router } from "express";
import { asyncHandler } from "./asyncHandler.js";

// Builds a standard CRUD router.
// options.authMiddleware   — middleware array applied to POST, PUT, DELETE
// options.ownerMiddleware  — middleware array applied to PUT and DELETE (ownership check)
// options.readMiddleware   — middleware array applied to GET (for protected resources)
// options.cacheMiddleware   — middleware applied before GET handlers for cacheable resources
export function createCrudRouter(controllers, options = {}) {
  const { authMiddleware = [], ownerMiddleware = [], readMiddleware = [], cacheMiddleware = null } = options;
  const router = Router();

  if (cacheMiddleware) {
    router.use(cacheMiddleware);
  }

  router
    .route("/")
    .get(...readMiddleware, asyncHandler(controllers.getAll))
    .post(...authMiddleware, asyncHandler(controllers.create));

  router
    .route("/:id")
    .get(...readMiddleware, asyncHandler(controllers.getById))
    .put(...authMiddleware, ...ownerMiddleware, asyncHandler(controllers.update))
    .delete(...authMiddleware, ...ownerMiddleware, asyncHandler(controllers.delete));

  return router;
}
