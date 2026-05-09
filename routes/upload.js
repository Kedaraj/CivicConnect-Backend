import express from "express";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Try Cloudinary, fallback to storing base64 directly
let cloudinary = null;
try {
  const mod = await import("../config/cloudinary.js");
  cloudinary = mod.default;
  if (!process.env.CLOUDINARY_API_KEY) cloudinary = null;
} catch { cloudinary = null; }

// Upload base64 media (photo/video/voice)
router.post("/", protect, async (req, res) => {
  try {
    const { data, type } = req.body;
    if (!data) return res.status(400).json({ message: "No file data provided" });

    // If Cloudinary is configured, use it
    if (cloudinary) {
      let resourceType = "image";
      if (type === "video" || type === "voice") resourceType = "video";
      const result = await cloudinary.uploader.upload(data, {
        resource_type: resourceType,
        folder: "civicconnect/evidence",
      });
      return res.json({ url: result.secure_url, type });
    }

    // Fallback: store base64 directly (works for small files)
    res.json({ url: data, type });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ message: "Upload failed: " + err.message });
  }
});

// Upload multiple files
router.post("/multiple", protect, async (req, res) => {
  try {
    const { files } = req.body;
    if (!files || !files.length) return res.status(400).json({ message: "No files provided" });

    const results = await Promise.all(
      files.map(async (f) => {
        if (cloudinary) {
          let resourceType = "image";
          if (f.type === "video" || f.type === "voice") resourceType = "video";
          const result = await cloudinary.uploader.upload(f.data, {
            resource_type: resourceType,
            folder: "civicconnect/evidence",
          });
          return { url: result.secure_url, type: f.type };
        }
        // Fallback: store base64 directly
        return { url: f.data, type: f.type };
      })
    );

    res.json(results);
  } catch (err) {
    console.error("Multi-upload error:", err.message);
    res.status(500).json({ message: "Upload failed: " + err.message });
  }
});

export default router;
