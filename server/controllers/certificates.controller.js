import { buildCrudControllers } from "./crudFactory.js";

const certificatesController = buildCrudControllers("certificates");

export const getAllCertificates = certificatesController.getAll;
export const getCertificateById = certificatesController.getById;
export const createCertificate = certificatesController.create;
export const updateCertificate = certificatesController.update;
export const deleteCertificate = certificatesController.delete;
