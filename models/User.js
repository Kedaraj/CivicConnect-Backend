import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["citizen", "police", "ambulance", "construction", "admin"],
      default: "citizen",
    },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    badge: { type: String, default: "" },
    stats: {
      reports: { type: Number, default: 0 },
      resolved: { type: Number, default: 0 },
      points: { type: Number, default: 0 },
    },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      updatedAt: { type: Date, default: Date.now },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
