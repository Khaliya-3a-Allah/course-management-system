import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // tracks who created this module for authorization checks
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

const Module = mongoose.model("Module", moduleSchema);
export default Module;
