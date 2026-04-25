import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
      index: true,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    body: { type: String, required: true, trim: true, maxlength: 3000 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    upvoteUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    upvotesCount: { type: Number, default: 0, min: 0 },
    isAccepted: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["published", "pending", "rejected"],
      default: "published",
      index: true,
    },
    moderationReason: { type: String, default: "", maxlength: 300 },
    spamScore: { type: Number, default: 0 },
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

commentSchema.index({ threadId: 1, status: 1, createdAt: 1 });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
