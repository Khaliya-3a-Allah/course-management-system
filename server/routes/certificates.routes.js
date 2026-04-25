import {
  getAllCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from "../controllers/certificates.controller.js";
import { createCrudRouter } from "../utils/createCrudRouter.js";
import {
  authenticateRequest,
  authorizeOwner,
} from "../middleware/authPlaceholder.js";

// GET /certificates        — authenticated
// GET /certificates/:id    — authenticated
// POST /certificates       — authenticated
// PUT /certificates/:id    — authenticated + owner
// DELETE /certificates/:id — authenticated + owner
export const certificatesRouter = createCrudRouter(
  {
    getAll: getAllCertificates,
    getById: getCertificateById,
    create: createCertificate,
    update: updateCertificate,
    delete: deleteCertificate,
  },
  {
    readMiddleware: [authenticateRequest],
    authMiddleware: [authenticateRequest],
    ownerMiddleware: [authorizeOwner("certificates")],
  }
);
