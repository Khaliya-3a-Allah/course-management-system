import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
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
    completedLessonIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    ],
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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

const Progress = mongoose.model("Progress", progressSchema);
export default Progress;
