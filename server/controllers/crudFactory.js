import { list, findById, create, update, remove } from "../data/store.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/User.js";
import { invalidateCachedResponses } from "../utils/responseCache.js";

export function buildCrudControllers(resourceName) {
  return {
    async getAll(req, res) {
      const data = await list(resourceName);
      res.status(200).json({ success: true, count: data.length, data });
    },

    async getById(req, res) {
      const item = await findById(resourceName, req.params.id);
      if (!item) {
        throw new ApiError(404, `${resourceName} item not found`);
      }
      res.status(200).json({ success: true, data: item });
    },

    async create(req, res) {
      const payload = { ...req.body };
      // Automatically record which user created this document (if authenticated)
      if (req.user) {
        payload.createdBy = req.user.id;
        if (resourceName === "courses") {
          payload.instructorId = req.user.id;
        }
      }
      const item = await create(resourceName, payload);
      if (!item) {
        throw new ApiError(400, `Unable to create ${resourceName} item with provided data`);
      }

      if (resourceName === "courses" && req.user && item?.id) {
        await User.findByIdAndUpdate(req.user.id, {
          $addToSet: { createdCourseIds: item.id },
        });
      }

      if (["courses", "modules", "lessons", "purchases"].includes(resourceName)) {
        invalidateCachedResponses([`${resourceName}:`, "courses:"]);
      }

      res.status(201).json({ success: true, data: item });
    },

    async update(req, res) {
      const item = await update(resourceName, req.params.id, req.body || {});
      if (!item) {
        throw new ApiError(404, `${resourceName} item not found`);
      }

      if (["courses", "modules", "lessons", "purchases"].includes(resourceName)) {
        invalidateCachedResponses([`${resourceName}:`, "courses:"]);
      }
      res.status(200).json({ success: true, data: item });
    },

    async delete(req, res) {
      const deleted = await remove(resourceName, req.params.id);
      if (!deleted) {
        throw new ApiError(404, `${resourceName} item not found`);
      }

      if (["courses", "modules", "lessons", "purchases"].includes(resourceName)) {
        invalidateCachedResponses([`${resourceName}:`, "courses:"]);
      }
      res.status(200).json({ success: true, data: deleted });
    },
  };
}
