/**
 * QR Code Generation Utility for Certificates
 * Uses a simple QR service URL generation approach
 */

/**
 * Generate a QR code URL for verification
 * Uses qr-server.com (free, no API key required)
 */
export const generateQRCodeUrl = (verificationUrl, size = 300) => {
  const encoded = encodeURIComponent(verificationUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
};

/**
 * Generate QR code data for embedding in PDF
 * Returns the image URL that can be used in jsPDF or HTML
 */
export const generateQRCodeData = (certificateId, baseUrl = "http://localhost:5173") => {
  const verificationUrl = `${baseUrl}/verify/${certificateId}`;
  return {
    verificationUrl,
    qrCodeUrl: generateQRCodeUrl(verificationUrl),
    qrCodeSmallUrl: generateQRCodeUrl(verificationUrl, 200),
    qrCodeLargeUrl: generateQRCodeUrl(verificationUrl, 400),
  };
};

/**
 * Generate data-URI QR code (for offline use)
 * Note: Returns a promise-based URL fetch
 */
export const generateQRCodeDataUri = async (verificationUrl) => {
  try {
    const qrUrl = generateQRCodeUrl(verificationUrl, 300);
    const response = await fetch(qrUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to generate QR code data URI:", error);
    return null;
  }
};

export default {
  generateQRCodeUrl,
  generateQRCodeData,
  generateQRCodeDataUri,
};
