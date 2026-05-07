import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes — verify JWT token
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return res.status(401).json({ message: "Not authorized — no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized — token invalid" });
  }
};

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role '${req.user.role}' not authorized` });
    }
    next();
  };
};

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "30d" });
};
