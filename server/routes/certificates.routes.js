import {
  getAllCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from "../controllers/certificates.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";

export const certificatesRouter = createCrudRouter({
  getAll: getAllCertificates,
  getById: getCertificateById,
  create: createCertificate,
  update: updateCertificate,
  delete: deleteCertificate,
});
