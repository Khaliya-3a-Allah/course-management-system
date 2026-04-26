import mongoose from "mongoose";

const abuseReportSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ["course", "user", "thread", "comment", "support-ticket", "other"],
      required: true,
      index: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    details: { type: String, default: "", trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["open", "reviewing", "resolved", "dismissed"],
      default: "open",
      index: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true,
    },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resolutionNote: { type: String, default: "", trim: true },
    resolvedAt: { type: Date, default: null },
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

abuseReportSchema.index({ status: 1, severity: -1, createdAt: -1 });

const AbuseReport = mongoose.model("AbuseReport", abuseReportSchema);
export default AbuseReport;
