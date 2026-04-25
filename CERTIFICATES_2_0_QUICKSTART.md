# Certificates 2.0 Implementation - Quick Start

## ✅ What's Implemented

### Backend Features
1. **Cryptographically Signed Certificates** - SHA-256 signed certificate IDs in format `CERT-{HASH}-{DATE}`
2. **Public Verification Endpoint** - `/certificates/verify/{certId}` (no auth required)
3. **QR Code Generation** - Dynamic QR codes linking to verification pages
4. **Certificate Revocation** - Revoke certificates with reasons and audit trail
5. **Issuance Logs** - Track all verifications with timestamps and IP addresses
6. **LinkedIn Share Integration** - Generate pre-populated LinkedIn share links
7. **Admin Endpoints** - Get issuance logs and certificate status

### Frontend Features
1. **Enhanced Certificate Cards** - Show certificate ID, QR codes, share buttons
2. **QR Code Modal** - Display and download QR codes
3. **Share Modal** - Share on LinkedIn, Twitter/X, Email, or copy verification link
4. **Public Verification Page** - `/verify/{certId}` shows certificate details (no login needed)
5. **PDF Downloads** - Certificates include QR code and verification URL
6. **Social Sharing** - LinkedIn, Twitter, Email share buttons with pre-filled text

## 🚀 Getting Started

### 1. Environment Setup
Add to your `.env` file:
```bash
CERTIFICATE_SIGNING_SECRET=your-random-32-char-secret-key
```

Or let it auto-generate (development only).

### 2. Database Update
The Certificate model now includes:
- `signedCertificateId` - Unique signed certificate ID
- `verificationToken` - Token for API verification
- `qrData` - QR code data and URLs
- `isRevoked`, `revocationReason`, `revokedAt`, `revokedBy` - Revocation fields
- `issuanceLog` - Verification tracking

### 3. API Usage

**Create a certificate:**
```bash
curl -X POST http://localhost:5000/api/v1/certificates \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "courseId": "course-id"
  }'
```

**Verify a certificate (public):**
```bash
curl http://localhost:5000/api/v1/certificates/verify/CERT-ABC123DE-20260425
```

**Revoke a certificate:**
```bash
curl -X POST http://localhost:5000/api/v1/certificates/{certId}/revoke \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Duplicate certificate"}'
```

### 4. Frontend Usage

**View certificates:** `/certificates` (authenticated)
- Download PDF with QR code
- View QR code in modal
- Share on LinkedIn, Twitter, Email
- Copy verification link

**Verify certificate:** `/verify/{certId}` (public)
- See certificate details
- View verification status
- Print or share

## 📋 Certificate ID Format

```
CERT-7F3A9B2C1E4D6A8F-20260425

Components:
- CERT: Prefix
- 7F3A9B2C1E4D6A8F: SHA-256 hash from userId:courseId:timestamp:secret
- 20260425: Issue date (YYYYMMDD)
```

The hash acts as a signature that cannot be forged without the signing secret.

## 🔒 Security Features

1. **Cryptographic Signatures** - Certificate IDs include SHA-256 hash that validates authenticity
2. **Revocation Support** - Instantly revoke fraudulent or duplicate certificates
3. **Verification Logging** - Track every verification with timestamp and IP
4. **Public Endpoint** - No authentication required for verification, but limited data exposure
5. **Admin Logs** - Full audit trail available to administrators

## 📱 Sharing Capabilities

Users can share their certificates via:
- **LinkedIn**: Pre-populated with course name and verification URL
- **Twitter/X**: Share achievement with hashtags
- **Email**: Send to friends and colleagues
- **Direct Link**: Copy verification URL to clipboard
- **QR Code**: Download QR code image for printing or sharing

## 📊 Verification Flow

```
User completes course
  ↓
Certificate created with signed ID
  ↓
User shares certificate (LinkedIn/Twitter/Email/QR)
  ↓
Recipient visits verification page
  ↓
Public API verifies signature and shows details
  ↓
Verification logged with timestamp and IP
```

## 🛠 API Endpoints Summary

### Public Endpoints (No Auth)
- `GET /api/v1/certificates/verify/{certId}` - Verify a certificate

### Protected Endpoints (Auth Required)
- `GET /api/v1/certificates` - Get all certificates
- `GET /api/v1/certificates/{id}` - Get specific certificate
- `POST /api/v1/certificates` - Create certificate
- `PUT /api/v1/certificates/{id}` - Update certificate
- `DELETE /api/v1/certificates/{id}` - Delete certificate
- `GET /api/v1/certificates/qr/{certId}` - Get QR code
- `GET /api/v1/certificates/logs/{certId}` - Get issuance logs (admin)
- `POST /api/v1/certificates/{certId}/revoke` - Revoke certificate
- `GET /api/v1/certificates/share/linkedin/{certId}` - Get LinkedIn share link

## 📚 Documentation

Full documentation available in [CERTIFICATES_2_0.md](./CERTIFICATES_2_0.md)

Includes:
- Complete API reference
- Database schema details
- Frontend component documentation
- Security considerations
- Migration guide
- Usage examples
- Troubleshooting guide

## ✨ Features at a Glance

| Feature | Status | Details |
|---------|--------|---------|
| Signed Certificate IDs | ✅ | SHA-256 cryptographic signing |
| Public Verification | ✅ | No authentication required |
| QR Codes | ✅ | Generated dynamically with QR Server API |
| Social Sharing | ✅ | LinkedIn, Twitter/X, Email support |
| Revocation | ✅ | With reason tracking and audit trail |
| Verification Logging | ✅ | IP and timestamp tracking |
| PDF Downloads | ✅ | Includes QR code and verification URL |
| Admin Dashboard | 🔄 | Can view issuance logs and revoke certs |
| Certificate Templates | 🔄 | Future enhancement |
| NFT Integration | 🔄 | Future enhancement |

## 🧪 Testing

Test the implementation:

1. **Create a certificate** (as admin/instructor)
2. **Download PDF** - Should include QR code and verification URL
3. **Scan QR code** - Should open verification page
4. **Share on LinkedIn** - Should open LinkedIn with pre-filled content
5. **Verify publicly** - Visit `/verify/{certId}` without login
6. **Revoke certificate** - Should mark as invalid and show reason
7. **Check logs** - Verify logs track verification attempts

## 💡 Pro Tips

- Users can download and print certificates with built-in QR codes for framing
- QR codes link to the public verification page for instant credibility checks
- Certificates are shareable without exposing sensitive user data
- Administrators can revoke fraudulent certificates instantly
- LinkedIn integration allows one-click professional sharing
- Verification page works on all devices without authentication

## 🐛 Troubleshooting

**Certificate not verifying?**
- Check signed certificate ID format (CERT-HASH-DATE)
- Ensure CERTIFICATE_SIGNING_SECRET is consistent across environments

**QR code not displaying?**
- Verify QR Server API is accessible (https://api.qrserver.com)
- Check browser console for CORS issues

**Sharing not working?**
- Ensure verification URL is publicly accessible
- Test direct URL sharing before social media links

**Logs not updating?**
- Check that certificate exists with proper ID
- Verify admin authentication token is valid

---

For detailed information, see [CERTIFICATES_2_0.md](./CERTIFICATES_2_0.md)
