import { list, findById, create, update, remove } from "../data/store.js";
import { ApiError } from "../utils/ApiError.js";

export function buildCrudControllers(resourceName) {
  return {
    getAll(req, res) {
      const data = list(resourceName);
      res.status(200).json({ success: true, count: data.length, data });
    },

    getById(req, res) {
      const item = findById(resourceName, req.params.id);
      if (!item) {
        throw new ApiError(404, `${resourceName} item not found`);
      }
      res.status(200).json({ success: true, data: item });
    },

    create(req, res) {
      const item = create(resourceName, req.body || {});
      if (!item) {
        throw new ApiError(400, `Unable to create ${resourceName} item with provided data`);
      }
      res.status(201).json({ success: true, data: item });
    },

    update(req, res) {
      const item = update(resourceName, req.params.id, req.body || {});
      if (!item) {
        throw new ApiError(404, `${resourceName} item not found`);
      }
      res.status(200).json({ success: true, data: item });
    },

    delete(req, res) {
      const deleted = remove(resourceName, req.params.id);
      if (!deleted) {
        throw new ApiError(404, `${resourceName} item not found`);
      }
      res.status(200).json({ success: true, data: deleted });
    },
  };
}
