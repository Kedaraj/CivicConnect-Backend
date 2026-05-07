import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import User from "../models/User.js";

const router = Router();

// @route   GET /api/users — List all users (admin only)
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/users/:id — Update user (admin only)
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/users/:id — Delete user (admin only)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
