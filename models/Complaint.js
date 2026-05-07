import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["pothole", "signal", "parking", "noise", "pollution", "other"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      address: { type: String, default: "" },
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "in_progress", "resolved", "rejected"],
      default: "pending",
    },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    evidence: [{ url: String, type: String }],
    resolution: { type: String, default: "" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
