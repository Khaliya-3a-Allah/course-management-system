import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema(
  {
    prompt: { type: String, trim: true, default: "" },
    type: {
      type: String,
      enum: ["multiple-choice", "true-false"],
      default: "multiple-choice",
    },
    options: {
      type: [String],
      default: [],
      validate: {
        validator(options) {
          return Array.isArray(options) && options.length >= 2 && options.length <= 6;
        },
        message: "Quiz questions need between 2 and 6 answer options.",
      },
    },
    correctOptionIndex: {
      type: Number,
      min: 0,
      default: 0,
      select: false,
    },
    explanation: { type: String, trim: true, default: "" },
    points: { type: Number, min: 1, max: 20, default: 1 },
  },
  { _id: true }
);

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    duration: { type: String, default: "" },
    order: { type: Number, default: 0 },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    quiz: {
      enabled: { type: Boolean, default: false },
      title: { type: String, trim: true, default: "" },
      instructions: { type: String, trim: true, default: "" },
      timeLimitMinutes: { type: Number, min: 1, max: 240, default: 10 },
      passingScore: { type: Number, min: 1, max: 100, default: 70 },
      maxAttempts: { type: Number, min: 1, max: 20, default: 3 },
      questions: { type: [quizQuestionSchema], default: [] },
    },
    // tracks who created this lesson for authorization checks
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
        if (ret.quiz?.questions) {
          ret.quiz.questions = ret.quiz.questions.map((question) => {
            const { correctOptionIndex, ...safeQuestion } = question;
            void correctOptionIndex;
            return safeQuestion;
          });
        }
        return ret;
      },
    },
  }
);

const Lesson = mongoose.model("Lesson", lessonSchema);
export default Lesson;
