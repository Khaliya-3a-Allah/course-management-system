import {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
} from "../controllers/purchases.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";
import {
  authenticateRequest,
  authorizeOwner,
} from "../middleware/authPlaceholder.js";

// GET /purchases        — authenticated
// GET /purchases/:id    — authenticated
// POST /purchases       — authenticated
// PUT /purchases/:id    — authenticated + must be owner
// DELETE /purchases/:id — authenticated + must be owner
export const purchasesRouter = createCrudRouter(
  {
    getAll: getAllPurchases,
    getById: getPurchaseById,
    create: createPurchase,
    update: updatePurchase,
    delete: deletePurchase,
  },
  {
    readMiddleware: [authenticateRequest],
    authMiddleware: [authenticateRequest],
    ownerMiddleware: [authorizeOwner("purchases")],
  }
);
