import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requesterName: { type: String, default: "", trim: true },
    requesterEmail: { type: String, default: "", trim: true, lowercase: true },
    topic: { type: String, default: "Other", trim: true },
    supportMode: {
      type: String,
      enum: ["email", "live"],
      default: "email",
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminReply: { type: String, default: "" },
    repliedAt: { type: Date, default: null },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    emailSentAt: { type: Date, default: null },
    messages: [
      {
        senderRole: {
          type: String,
          enum: ["user", "admin"],
          required: true,
        },
        senderName: { type: String, default: "" },
        senderEmail: { type: String, default: "" },
        body: { type: String, required: true, trim: true, maxlength: 3000 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
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

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
export default SupportTicket;
