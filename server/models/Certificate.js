import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    issuedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Certificate 2.0 - Verifiable fields
    signedCertificateId: {
      type: String,
      unique: true,
      sparse: true,
      required: true,
      index: true,
    },
    verificationToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    qrData: { type: String }, // JSON stringified QR data
    isRevoked: { type: Boolean, default: false },
    revocationReason: { type: String, default: "" },
    revokedAt: { type: Date, default: null },
    revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    issuanceLog: {
      userId: { type: String },
      userName: { type: String },
      courseName: { type: String },
      issuedAt: { type: Date, default: Date.now },
      verifications: [
        {
          verifiedAt: { type: Date, default: Date.now },
          verifierIp: { type: String },
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
