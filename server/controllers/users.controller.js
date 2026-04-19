import { buildCrudControllers } from "./crudFactory.js";

const usersController = buildCrudControllers("users");

export const getAllUsers = usersController.getAll;
export const getUserById = usersController.getById;
export const createUser = usersController.create;
export const updateUser = usersController.update;
export const deleteUser = usersController.delete;
