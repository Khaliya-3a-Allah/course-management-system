import mongoose from "mongoose";

const threadSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    tags: [{ type: String, trim: true, lowercase: true }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    upvoteUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    upvotesCount: { type: Number, default: 0, min: 0 },
    commentCount: { type: Number, default: 0, min: 0 },
    acceptedCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    status: {
      type: String,
      enum: ["published", "pending", "rejected", "locked"],
      default: "published",
      index: true,
    },
    moderationReason: { type: String, default: "", maxlength: 300 },
    spamScore: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    lastActivityAt: { type: Date, default: Date.now, index: true },
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

threadSchema.index({ courseId: 1, lessonId: 1, status: 1, lastActivityAt: -1 });

const Thread = mongoose.model("Thread", threadSchema);
export default Thread;
