import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    // instructor display name (denormalized for read performance)
    instructor: { type: String, default: "" },
    // reference to the User who created this course (ownership)
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    price: { type: Number, default: 0 },
    category: { type: String, default: "" },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    thumbnail: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    enrolled: { type: Number, default: 0 },
    tags: [{ type: String }],
    language: { type: String, default: "English" },
    duration: { type: String, default: "" },
    isPublished: { type: Boolean, default: false },
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

const Course = mongoose.model("Course", courseSchema);
export default Course;
