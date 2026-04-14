import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select: false means password is never returned in queries unless explicitly asked
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    phone: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    createdCourseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    enrolledCourseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    purchasedCourseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    savedCourseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    completedCourseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
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

const User = mongoose.model("User", userSchema);
export default User;
