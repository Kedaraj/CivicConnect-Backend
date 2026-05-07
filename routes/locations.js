import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import User from "../models/User.js";

const router = Router();

// @route   POST /api/locations — Update my GPS location
router.post("/", protect, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      "location.lat": lat,
      "location.lng": lng,
      "location.updatedAt": new Date(),
    });
    res.json({ message: "Location updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/locations/active — Get active field users (police, ambulance, construction)
router.get("/active", protect, authorize("police", "ambulance", "admin"), async (req, res) => {
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const users = await User.find({
      role: { $in: ["police", "ambulance", "construction"] },
      isActive: true,
      "location.updatedAt": { $gte: fiveMinAgo },
    }).select("name role location avatar phone");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
