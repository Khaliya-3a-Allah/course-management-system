import {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
} from "../controllers/modules.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";
import { createCacheMiddleware } from "../utils/responseCache.js";
import {
  authenticateRequest,
  authorizeOwner,
} from "../middleware/authPlaceholder.js";

// GET /modules        — public
// GET /modules/:id    — public
// POST /modules       — authenticated
// PUT /modules/:id    — authenticated + must be creator
// DELETE /modules/:id — authenticated + must be creator
export const modulesRouter = createCrudRouter(
  {
    getAll: getAllModules,
    getById: getModuleById,
    create: createModule,
    update: updateModule,
    delete: deleteModule,
  },
  {
    authMiddleware: [authenticateRequest],
    ownerMiddleware: [authorizeOwner("modules")],
    cacheMiddleware: createCacheMiddleware({
      keyBuilder: (req) => {
        if (req.method !== "GET") return null;
        return `modules:${req.originalUrl}`;
      },
      ttlMs: 15_000,
    }),
  }
);
