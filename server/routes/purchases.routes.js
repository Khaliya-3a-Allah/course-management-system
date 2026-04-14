import {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
} from "../controllers/purchases.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";

export const purchasesRouter = createCrudRouter({
  getAll: getAllPurchases,
  getById: getPurchaseById,
  create: createPurchase,
  update: updatePurchase,
  delete: deletePurchase,
});
