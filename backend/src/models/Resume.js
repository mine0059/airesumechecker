const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxLength: 120 },
    currentVersionId: {
      type: mongoose.Schema.ObjectId,
      ref: "ResumeVersion",
      default: null,
    },
    latestVersionNumber: { type: Number, default: 0 },
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1, updatedAt: 0 });

module.exports = mongoose.model("Resume", resumeSchema);
