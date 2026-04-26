import { Router } from "express";
import {
  getAllCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  verifyCertificate,
  getCertificateQRCode,
  getCertificateLogs,
  revokeCertificate,
  getLinkedInShareLink,
} from "../controllers/certificates.controller.js";
import {
  authenticateRequest,
  authorizeOwner,
} from "../middleware/authPlaceholder.js";

const router = Router();

// Public verification endpoint - NO authentication required
router.get("/verify/:certificateId", verifyCertificate);

// Authenticated routes
router.use(authenticateRequest);

// GET /certificates        — authenticated
router.get("/", getAllCertificates);

// Certificate 2.0 endpoints

// Get QR code for certificate
router.get("/qr/:certificateId", getCertificateQRCode);

// Get certificate issuance logs (admin only)
router.get("/logs/:certificateId", getCertificateLogs);

// Get LinkedIn share link
router.get("/share/linkedin/:certificateId", getLinkedInShareLink);

// GET /certificates/:id    — authenticated
router.get("/:id", getCertificateById);

// POST /certificates       — authenticated
router.post("/", createCertificate);

// PUT /certificates/:id    — authenticated + owner
router.put("/:id", authorizeOwner("certificates"), updateCertificate);

// DELETE /certificates/:id — authenticated + owner
router.delete("/:id", authorizeOwner("certificates"), deleteCertificate);

// Revoke certificate (owner or admin only)
router.post("/:certificateId/revoke", revokeCertificate);

export { router as certificatesRouter };
