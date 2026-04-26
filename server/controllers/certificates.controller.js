import { buildCrudControllers } from "./crudFactory.js";
import Certificate from "../models/Certificate.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import {
  generateSignedCertificateId,
  generateVerificationToken,
  generateLinkedInShareText,
} from "../utils/certificateSigning.js";
import { generateQRCodeData } from "../utils/qrCode.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";

const certificatesController = buildCrudControllers("certificates");

export const getAllCertificates = asyncHandler(async (req, res) => {
  const filter = req.user?.role === "admin" ? {} : { userId: req.user.id };
  const certificates = await Certificate.find(filter)
    .populate("userId", "name email")
    .populate("courseId", "title description instructorName")
    .sort({ issuedAt: -1 })
    .lean({ virtuals: true });

  res.status(200).json({
    success: true,
    count: certificates.length,
    data: certificates,
  });
});
export const getCertificateById = certificatesController.getById;
export const createCertificate = asyncHandler(async (req, res) => {
  const { userId, courseId } = req.body;

  // Get user and course data for issuance log
  const [user, course] = await Promise.all([
    User.findById(userId),
    Course.findById(courseId),
  ]);

  if (!user || !course) {
    throw new ApiError(400, "User or Course not found");
  }

  const existingCertificate = await Certificate.findOne({ userId, courseId });
  if (existingCertificate) {
    res.status(200).json({
      success: true,
      data: existingCertificate,
    });
    return;
  }

  // Generate signed certificate ID
  const signedCertificateId = generateSignedCertificateId(userId, courseId);
  const verificationToken = generateVerificationToken(signedCertificateId);

  // Generate QR code data
  const qrData = generateQRCodeData(signedCertificateId, env.CLIENT_ORIGIN);

  // Create certificate with verification fields
  const certificate = await Certificate.create({
    userId,
    courseId,
    signedCertificateId,
    verificationToken,
    qrData: JSON.stringify(qrData),
    issuanceLog: {
      userId: user.id,
      userName: user.name,
      courseName: course.title,
      issuedAt: new Date(),
      verifications: [],
    },
    createdBy: req.user?.id,
  });

  res.status(201).json({
    success: true,
    data: certificate,
  });
});

export const updateCertificate = certificatesController.update;
export const deleteCertificate = certificatesController.delete;

/**
 * Public endpoint to verify a certificate
 * No authentication required
 */
export const verifyCertificate = asyncHandler(async (req, res) => {
  const { certificateId } = req.params;

  const certificate = await Certificate.findOne({
    signedCertificateId: certificateId,
  })
    .populate("userId", "name email")
    .populate("courseId", "title description instructorName");

  if (!certificate) {
    res.status(200).json({
      success: true,
      valid: false,
      available: false,
      message: "Certificate is not available in the database",
    });
    return;
  }

  // Check if revoked
  if (certificate.isRevoked) {
    res.status(200).json({
      success: true,
      valid: false,
      available: true,
      message: "Certificate has been revoked",
      revocationReason: certificate.revocationReason,
      revokedAt: certificate.revokedAt,
    });
    return;
  }

  // Log verification attempt
  const clientIp =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    "unknown";
  certificate.issuanceLog.verifications.push({
    verifiedAt: new Date(),
    verifierIp: clientIp,
  });
  await certificate.save();

  // Return verification details
  res.status(200).json({
    success: true,
    valid: true,
    available: true,
    certificate: {
      id: certificate.signedCertificateId,
      recipientName: certificate.userId.name,
      recipientEmail: certificate.userId.email,
      courseName: certificate.courseId.title,
      courseDescription: certificate.courseId.description,
      instructorName: certificate.courseId.instructorName,
      issuedAt: certificate.issuedAt,
      verificationCount: certificate.issuanceLog.verifications.length,
    },
  });
});

/**
 * Get QR code for a certificate
 */
export const getCertificateQRCode = asyncHandler(async (req, res) => {
  const { certificateId } = req.params;

  const certificate = await Certificate.findOne({
    signedCertificateId: certificateId,
  });

  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  const qrData = JSON.parse(certificate.qrData);

  res.status(200).json({
    success: true,
    qrCode: qrData,
  });
});

/**
 * Get certificate issuance logs (admin only)
 */
export const getCertificateLogs = asyncHandler(async (req, res) => {
  const { certificateId } = req.params;

  const certificate = await Certificate.findOne({
    signedCertificateId: certificateId,
  });

  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  res.status(200).json({
    success: true,
    logs: {
      issuanceLog: certificate.issuanceLog,
      isRevoked: certificate.isRevoked,
      revocationReason: certificate.revocationReason,
      revokedAt: certificate.revokedAt,
    },
  });
});

/**
 * Revoke a certificate
 */
export const revokeCertificate = asyncHandler(async (req, res) => {
  const { certificateId } = req.params;
  const { reason } = req.body;

  const certificate = await Certificate.findOne({
    signedCertificateId: certificateId,
  });

  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  if (certificate.isRevoked) {
    throw new ApiError(400, "Certificate is already revoked");
  }

  certificate.isRevoked = true;
  certificate.revocationReason = reason || "No reason provided";
  certificate.revokedAt = new Date();
  certificate.revokedBy = req.user?.id;

  await certificate.save();

  res.status(200).json({
    success: true,
    message: "Certificate revoked successfully",
    data: certificate,
  });
});

/**
 * Get LinkedIn share link
 */
export const getLinkedInShareLink = asyncHandler(async (req, res) => {
  const { certificateId } = req.params;

  const certificate = await Certificate.findOne({
    signedCertificateId: certificateId,
  })
    .populate("userId", "name")
    .populate("courseId", "title");

  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  const verificationUrl = `${req.protocol}://${req.get("host")}/verify/${certificateId}`;
  const shareText = generateLinkedInShareText(
    certificate.userId.name,
    certificate.courseId.title,
    certificateId,
    verificationUrl
  );

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`;

  res.status(200).json({
    success: true,
    shareLink: linkedInUrl,
    shareText,
    verificationUrl,
  });
});
