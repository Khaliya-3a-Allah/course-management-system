# Certificates 2.0 - Verifiable Certificates Documentation

## Overview

Certificates 2.0 is a comprehensive feature that adds verifiable, shareable, and revocable digital certificates to the Courseware platform. It provides users with trustworthy credentials they can share on LinkedIn, via email, or through direct links.

## Features

### Frontend Features
- **Download Certificates**: Generate professional PDF certificates with signature and QR codes
- **Share Certificates**: Multiple sharing options including LinkedIn, Twitter, and email
- **QR Code Verification**: Generate and display QR codes for easy certificate verification
- **Public Verification Page**: Anonymous users can verify certificate authenticity at `/verify/:certId`
- **Certificate Display**: Show certificate details, recipient information, and course details

### Backend Features
- **Signed Certificate IDs**: Cryptographically signed certificate identifiers using SHA-256 hashing
- **QR Code Generation**: Dynamic QR code generation using QR Server API
- **Certificate Verification Endpoint**: Public API endpoint for certificate verification without authentication
- **Revocation Support**: Ability to revoke certificates with reasons
- **Issuance Logs**: Track all verifications and revocation history
- **Verification Tracking**: Log each verification attempt with IP and timestamp

## Architecture

### Database Schema

```javascript
// Certificate Model fields (2.0 additions)
{
  // Basic fields
  userId: ObjectId,           // Reference to user
  courseId: ObjectId,         // Reference to course
  issuedAt: Date,            // Issue date
  createdBy: ObjectId,       // Admin who created it

  // Certificate 2.0 - Verification fields
  signedCertificateId: String,      // Unique signed certificate ID (CERT-HASH-DATE)
  verificationToken: String,        // Token for verification API
  qrData: String,                  // JSON stringified QR code data
  
  // Revocation
  isRevoked: Boolean,              // Revocation status
  revocationReason: String,        // Why it was revoked
  revokedAt: Date,                // When it was revoked
  revokedBy: ObjectId,            // Who revoked it
  
  // Logging
  issuanceLog: {
    userId: String,
    userName: String,
    courseName: String,
    issuedAt: Date,
    verifications: [               // Array of verification attempts
      {
        verifiedAt: Date,
        verifierIp: String
      }
    ]
  }
}
```

## API Endpoints

### Certificate Management

#### Create Certificate
```http
POST /api/v1/certificates
Content-Type: application/json
Authorization: Bearer {token}

{
  "userId": "user-id",
  "courseId": "course-id"
}

Response:
{
  "success": true,
  "data": {
    "id": "cert-id",
    "signedCertificateId": "CERT-ABC123DE-20260425",
    "userId": "user-id",
    "courseId": "course-id",
    "issuedAt": "2026-04-25T10:30:00Z",
    "qrData": "{...}",
    "isRevoked": false
  }
}
```

#### Get All Certificates (User)
```http
GET /api/v1/certificates
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    { /* certificate objects */ }
  ]
}
```

#### Get Certificate by ID
```http
GET /api/v1/certificates/{id}
Authorization: Bearer {token}
```

#### Update Certificate
```http
PUT /api/v1/certificates/{id}
Content-Type: application/json
Authorization: Bearer {token}

{ /* updated fields */ }
```

#### Delete Certificate
```http
DELETE /api/v1/certificates/{id}
Authorization: Bearer {token}
```

### Verification Endpoints

#### Verify Certificate (Public - No Auth Required)
```http
GET /api/v1/certificates/verify/{certificateId}

Response (Valid):
{
  "success": true,
  "valid": true,
  "certificate": {
    "id": "CERT-ABC123DE-20260425",
    "recipientName": "John Doe",
    "recipientEmail": "john@example.com",
    "courseName": "Advanced React Patterns",
    "courseDescription": "...",
    "instructorName": "Jane Smith",
    "issuedAt": "2026-04-25T10:30:00Z",
    "verificationCount": 5
  }
}

Response (Invalid/Revoked):
{
  "success": true,
  "valid": false,
  "message": "Certificate has been revoked",
  "revocationReason": "Duplicate certificate",
  "revokedAt": "2026-04-26T14:00:00Z"
}
```

#### Get QR Code
```http
GET /api/v1/certificates/qr/{certificateId}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "qrCode": {
    "verificationUrl": "http://localhost:5173/verify/CERT-ABC123DE-20260425",
    "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?...",
    "qrCodeSmallUrl": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&...",
    "qrCodeLargeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=400x400&..."
  }
}
```

#### Get Issuance Logs (Admin Only)
```http
GET /api/v1/certificates/logs/{certificateId}
Authorization: Bearer {admin-token}

Response:
{
  "success": true,
  "logs": {
    "issuanceLog": {
      "userId": "user-id",
      "userName": "John Doe",
      "courseName": "Advanced React Patterns",
      "issuedAt": "2026-04-25T10:30:00Z",
      "verifications": [
        {
          "verifiedAt": "2026-04-25T10:35:00Z",
          "verifierIp": "192.168.1.100"
        },
        ...
      ]
    },
    "isRevoked": false
  }
}
```

#### Revoke Certificate
```http
POST /api/v1/certificates/{certificateId}/revoke
Content-Type: application/json
Authorization: Bearer {token}

{
  "reason": "Fraudulent activity detected"
}

Response:
{
  "success": true,
  "message": "Certificate revoked successfully",
  "data": { /* certificate object */ }
}
```

#### Get LinkedIn Share Link
```http
GET /api/v1/certificates/share/linkedin/{certificateId}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "shareLink": "https://www.linkedin.com/sharing/share-offsite/?url=...",
  "shareText": "I just completed the \"Advanced React Patterns\" course on Courseware! 🎓\n\nCertificate ID: CERT-ABC123DE-20260425\nVerify: http://localhost:5173/verify/CERT-ABC123DE-20260425\n\n#Learning #CourseCompletion #Courseware #ProfessionalDevelopment",
  "verificationUrl": "http://localhost:5173/verify/CERT-ABC123DE-20260425"
}
```

## Frontend Implementation

### Pages

#### `/certificates` - My Certificates (Protected)
Displays all certificates earned by the current user with options to:
- Download PDF certificate
- View QR code
- Share on social media
- View certificate details

Features:
- Certificate cards with course information
- Primary actions: View Course, Download PDF
- Secondary actions: QR Code, Share
- No certificates state with CTA to browse courses

#### `/verify/{certId}` - Public Verification (No Auth)
Displays certificate verification details and allows anyone to confirm the validity of a certificate.

Features:
- Certificate validation status (✓ Valid or ⚠️ Invalid)
- Recipient information
- Course details
- Issue date
- Verification count
- QR code display
- Print and LinkedIn share buttons
- Revocation information (if applicable)

### Components

#### QRCodeModal
Modal dialog showing:
- QR code image (300x300px)
- Verification instructions
- Download QR code button
- Close button

#### ShareModal
Modal dialog with sharing options:
- Copy verification link
- LinkedIn share button
- Twitter/X share button
- Email share button
- Direct URL display

### Utilities

#### certificateUtils.js
Helper functions for:
- `generateLinkedInShareUrl()` - Generate LinkedIn share URL
- `generateTwitterShareUrl()` - Generate Twitter/X share URL
- `generateEmailShareLink()` - Generate email share link
- `generateQRCodeUrl()` - Generate QR code image URL
- `copyToClipboard()` - Copy text to clipboard
- `formatCertificateVerification()` - Format certificate data for display

## Backend Implementation

### Controllers

#### certificates.controller.js
Handles:
- Certificate creation with signing
- Verification endpoint
- QR code retrieval
- Issuance log retrieval
- Certificate revocation
- LinkedIn share link generation

### Utilities

#### certificateSigning.js
Cryptographic operations:
- `generateSignedCertificateId()` - Create signed cert ID (CERT-HASH-DATE format)
- `generateVerificationToken()` - Create verification token
- `verifyCertificateSignature()` - Validate cert signature
- `generateVerificationUrl()` - Create verification URL
- `generateLinkedInShareText()` - Generate share text

#### qrCode.js
QR code generation:
- `generateQRCodeUrl()` - Get QR code image URL
- `generateQRCodeData()` - Get all QR code URLs (small, medium, large)
- `generateQRCodeDataUri()` - Generate data URI (for offline use)

### Routes

#### certificates.routes.js
Endpoints:
- `GET /verify/:certificateId` - Public verification (no auth)
- `GET /` - Get all certificates (authenticated)
- `GET /:id` - Get certificate by ID (authenticated)
- `POST /` - Create certificate (authenticated)
- `PUT /:id` - Update certificate (owner/admin)
- `DELETE /:id` - Delete certificate (owner/admin)
- `GET /qr/:certificateId` - Get QR code (authenticated)
- `GET /logs/:certificateId` - Get logs (admin only)
- `POST /:certificateId/revoke` - Revoke certificate
- `GET /share/linkedin/:certificateId` - Get LinkedIn share link

## Certificate ID Format

Certificate IDs follow a specific format for cryptographic verification:

```
CERT-{HASH}-{DATE}

Examples:
CERT-7F3A9B2C1E4D6A8F-20260425
CERT-5C2B8E1A9D3F6C4E-20260424
```

**Components:**
- `CERT` - Prefix indicating certificate type
- `{HASH}` - 16-character SHA-256 hash derived from userId, courseId, timestamp, and signing secret
- `{DATE}` - Certificate issue date in YYYYMMDD format (no hyphens)

### Signature Verification
The certificate ID itself acts as the signature. It can be verified by:
1. Extracting userId, courseId, and issuedAt from the database
2. Regenerating the hash using the same algorithm
3. Comparing with the certificate ID

This ensures the certificate cannot be modified without detection.

## Configuration

### Environment Variables

```bash
# Certificate signing secret (required for production)
CERTIFICATE_SIGNING_SECRET=your-long-random-secret-key

# Optional (defaults shown)
NODE_ENV=production
PORT=5000
API_PREFIX=/api/v1
CLIENT_ORIGIN=http://localhost:5173
```

## Security Considerations

1. **Signed IDs**: Certificate IDs are cryptographically signed and cannot be forged without the signing secret
2. **Public Verification**: Verification endpoint doesn't require authentication, but only returns non-sensitive information
3. **IP Logging**: Verification attempts are logged with IP addresses for fraud detection
4. **Revocation**: Certificates can be revoked with audit trail
5. **Secure Secret**: The `CERTIFICATE_SIGNING_SECRET` should be:
   - At least 32 characters long
   - Randomly generated
   - Kept secure in production
   - Never exposed in client-side code

## Usage Examples

### Creating a Certificate (Backend)
```javascript
import { generateSignedCertificateId } from './utils/certificateSigning.js';

const userId = "60d5ec49c1234567890abcde";
const courseId = "60d5ec49c1234567890abcdf";
const signedId = generateSignedCertificateId(userId, courseId);
// Returns: CERT-7F3A9B2C1E4D6A8F-20260425

// Create in database
const certificate = await Certificate.create({
  userId,
  courseId,
  signedCertificateId: signedId,
  verificationToken: generateVerificationToken(signedId),
  qrData: JSON.stringify(generateQRCodeData(signedId)),
});
```

### Verifying a Certificate (Public)
```javascript
// Frontend API call
const response = await fetch('/api/v1/certificates/verify/CERT-7F3A9B2C1E4D6A8F-20260425');
const data = await response.json();

if (data.valid) {
  console.log(`Certificate belongs to ${data.certificate.recipientName}`);
  console.log(`Course: ${data.certificate.courseName}`);
  console.log(`Verified ${data.certificate.verificationCount} times`);
}
```

### Sharing on LinkedIn (Frontend)
```javascript
import { generateLinkedInShareUrl } from './utils/certificateUtils.js';

const certId = 'CERT-7F3A9B2C1E4D6A8F-20260425';
const verificationUrl = `${window.location.origin}/verify/${certId}`;
const linkedInUrl = generateLinkedInShareUrl(verificationUrl);

// Opens LinkedIn share dialog
window.open(linkedInUrl, '_blank');
```

## Migration Guide

If upgrading from Certificates 1.0:

1. **Database Migration**: Add new fields to existing certificates:
   ```javascript
   db.certificates.updateMany({}, {
     $set: {
       isRevoked: false,
       revocationReason: "",
       revokedAt: null,
       revokedBy: null,
       issuanceLog: {
         userId: "",
         userName: "",
         courseName: "",
         issuedAt: new Date(),
         verifications: []
       }
     }
   })
   ```

2. **Generate Signed IDs**: Run migration to populate `signedCertificateId` and `verificationToken`:
   ```javascript
   // Migration script
   const { generateSignedCertificateId, generateVerificationToken } = 
     require('./utils/certificateSigning.js');

   const certs = await Certificate.find({ signedCertificateId: { $exists: false } });
   
   for (const cert of certs) {
     cert.signedCertificateId = generateSignedCertificateId(cert.userId, cert.courseId, cert.issuedAt);
     cert.verificationToken = generateVerificationToken(cert.signedCertificateId);
     await cert.save();
   }
   ```

## Troubleshooting

### Certificate ID Mismatch
**Issue**: Generated certificate ID doesn't match the one in the database

**Solution**: Ensure the `CERTIFICATE_SIGNING_SECRET` is the same in all environments. Regenerate the secret if needed.

### QR Code Not Loading
**Issue**: QR code image not displaying

**Solution**: Check if the QR Server API is accessible. The API URL should be `https://api.qrserver.com/v1/create-qr-code/?...`

### Verification Endpoint Returns 404
**Issue**: Public verification page shows certificate not found

**Solution**: Ensure the certificate ID format is correct (CERT-HASH-DATE). Check that the certificate exists in the database.

### Verification Count Not Increasing
**Issue**: Verification count stays the same after visiting verification page

**Solution**: Ensure the verification endpoint is properly logging verification attempts. Check the backend logs.

## Future Enhancements

- [ ] Blockchain-based certificate storage
- [ ] NFT certificate issuance
- [ ] Digital signature with admin keys
- [ ] Certificate template customization
- [ ] Batch certificate generation
- [ ] Certificate expiration dates
- [ ] Multiple signature support
- [ ] Certificate status dashboard for admins
- [ ] Integration with credential wallets
- [ ] Verification badges on user profiles

## Support

For issues or questions about Certificates 2.0, refer to the API documentation or contact the development team.
