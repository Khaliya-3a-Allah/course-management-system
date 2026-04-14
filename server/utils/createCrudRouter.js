import { Router } from "express";
import { asyncHandler } from "./asyncHandler.js";

export function createCrudRouter(controllers) {
  const router = Router();

  router.route("/")
    .get(asyncHandler(controllers.getAll))
    .post(asyncHandler(controllers.create));

  router.route("/:id")
    .get(asyncHandler(controllers.getById))
    .put(asyncHandler(controllers.update))
    .delete(asyncHandler(controllers.delete));

  return router;
}
