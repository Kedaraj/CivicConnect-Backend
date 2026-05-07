import User from "../models/User.js";
import { generateToken } from "../middleware/auth.js";

// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, role: role || "citizen", phone });
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Provide email and password" });

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      stats: user.stats,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   PUT /api/auth/me
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password update here
    delete updates.role; // Don't allow role change
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
