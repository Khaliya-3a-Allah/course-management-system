import mongoose from "mongoose";

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
        return ret;
      },
    },
  }
);

const Lesson = mongoose.model("Lesson", lessonSchema);
export default Lesson;
