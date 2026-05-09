import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["accident", "traffic_jam", "road_damage", "pothole", "illegal_parking", "waterlogging"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: "" },
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
    },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    evidence: [
      {
        url: { type: String },
        type: { type: String, enum: ["photo", "video", "voice"], default: "photo" },
      },
    ],
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Incident", incidentSchema);
