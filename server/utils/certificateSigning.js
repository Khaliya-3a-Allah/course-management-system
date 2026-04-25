import crypto from "crypto";
import { env } from "../config/env.js";

const SIGNING_SECRET = env.CERTIFICATE_SIGNING_SECRET;

/**
 * Generate a unique signed certificate ID
 * Format: CERT-{hash}-{timestamp}
 */
export const generateSignedCertificateId = (userId, courseId, timestamp = Date.now()) => {
  const data = `${userId}:${courseId}:${timestamp}:${SIGNING_SECRET}`;
  const hash = crypto
    .createHash("sha256")
    .update(data)
    .digest("hex")
    .substring(0, 16)
    .toUpperCase();

  const dateStr = new Date(timestamp).toISOString().split("T")[0].replace(/-/g, "");
  return `CERT-${hash}-${dateStr}`;
};

/**
 * Generate a verification token for the certificate
 * Used to allow public verification without exposing sensitive data
 */
export const generateVerificationToken = (certificateId, secret = SIGNING_SECRET) => {
  const data = `${certificateId}:${secret}:${Date.now()}`;
  return crypto.createHash("sha256").update(data).digest("hex");
};

/**
 * Verify a certificate's authenticity by checking its signature
 */
export const verifyCertificateSignature = (certificateId, userId, courseId, issuedTimestamp) => {
  const expectedId = generateSignedCertificateId(userId, courseId, issuedTimestamp);
  return certificateId === expectedId;
};

/**
 * Generate a shareable verification URL
 */
export const generateVerificationUrl = (certificateId, baseUrl = "http://localhost:5173") => {
  return `${baseUrl}/verify/${certificateId}`;
};

/**
 * LinkedIn share text for the certificate
 */
export const generateLinkedInShareText = (userName, courseName, certificateId, verificationUrl) => {
  return `I just completed the "${courseName}" course on Courseware! 🎓

Certificate ID: ${certificateId}
Verify: ${verificationUrl}

#Learning #CourseCompletion #Courseware #ProfessionalDevelopment`;
};

export default {
  generateSignedCertificateId,
  generateVerificationToken,
  verifyCertificateSignature,
  generateVerificationUrl,
  generateLinkedInShareText,
};
