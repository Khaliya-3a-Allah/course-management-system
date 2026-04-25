/**
 * Certificate utilities for sharing and verification
 */

/**
 * Generate LinkedIn share URL for a certificate
 */
export const generateLinkedInShareUrl = (verificationUrl) => {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`;
};

/**
 * Generate Twitter/X share URL for a certificate
 */
export const generateTwitterShareUrl = (courseName, verificationUrl) => {
  const text = `I just completed the "${courseName}" course on Courseware! 🎓 Verify my certificate: ${verificationUrl}`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=Learning,CourseCompletion,Courseware`;
};

/**
 * Generate email share link for a certificate
 */
export const generateEmailShareLink = (courseName, verificationUrl) => {
  const subject = "Check Out My Course Certificate!";
  const body = `I just completed the "${courseName}" course on Courseware! You can verify my certificate here: ${verificationUrl}`;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

/**
 * Generate QR code URL for a certificate
 */
export const generateQRCodeUrl = (verificationUrl, size = 300) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(verificationUrl)}`;
};

/**
 * Copy text to clipboard with feedback
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};

/**
 * Format certificate verification response
 */
export const formatCertificateVerification = (certData) => {
  return {
    recipientName: certData.recipientName,
    courseName: certData.courseName,
    instructorName: certData.instructorName,
    issuedDate: new Date(certData.issuedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    certificateId: certData.id,
    verificationCount: certData.verificationCount,
  };
};

export default {
  generateLinkedInShareUrl,
  generateTwitterShareUrl,
  generateEmailShareLink,
  generateQRCodeUrl,
  copyToClipboard,
  formatCertificateVerification,
};
