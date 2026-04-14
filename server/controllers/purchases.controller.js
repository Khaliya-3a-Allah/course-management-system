import { buildCrudControllers } from "./crudFactory.js";

const purchasesController = buildCrudControllers("purchases");

export const getAllPurchases = purchasesController.getAll;
export const getPurchaseById = purchasesController.getById;
export const createPurchase = purchasesController.create;
export const updatePurchase = purchasesController.update;
export const deletePurchase = purchasesController.delete;
