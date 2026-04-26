import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    selectedOptionIndex: { type: Number, default: null },
    correctOptionIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    pointsAwarded: { type: Number, default: 0 },
    pointsPossible: { type: Number, default: 1 },
  },
  { _id: false }
);

const assessmentAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    answers: { type: [answerSchema], default: [] },
    score: { type: Number, min: 0, max: 100, required: true },
    pointsAwarded: { type: Number, default: 0 },
    pointsPossible: { type: Number, default: 0 },
    passed: { type: Boolean, default: false, index: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: Date.now },
    durationSeconds: { type: Number, min: 0, default: 0 },
    antiCheat: {
      blurCount: { type: Number, min: 0, default: 0 },
      pasteCount: { type: Number, min: 0, default: 0 },
      visibilityHiddenCount: { type: Number, min: 0, default: 0 },
      userAgent: { type: String, default: "" },
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

assessmentAttemptSchema.index({ userId: 1, lessonId: 1, createdAt: -1 });

const AssessmentAttempt = mongoose.model(
  "AssessmentAttempt",
  assessmentAttemptSchema
);

export default AssessmentAttempt;
