import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["accident", "traffic", "weather", "police", "emergency", "vip"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      area: { type: String, default: "" },
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);
