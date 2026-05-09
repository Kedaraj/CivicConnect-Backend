import express from "express";
import cloudinary from "../config/cloudinary.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Upload base64 media (photo/video/voice)
router.post("/", protect, async (req, res) => {
  try {
    const { data, type } = req.body; // data = base64 string, type = photo|video|voice

    if (!data) {
      return res.status(400).json({ message: "No file data provided" });
    }

    // Determine resource type for Cloudinary
    let resourceType = "image";
    if (type === "video") resourceType = "video";
    if (type === "voice") resourceType = "video"; // Cloudinary stores audio as video

    const result = await cloudinary.uploader.upload(data, {
      resource_type: resourceType,
      folder: "civicconnect/evidence",
      transformation: type === "photo" ? [{ width: 1200, crop: "limit", quality: "auto" }] : undefined,
    });

    res.json({
      url: result.secure_url,
      type,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ message: "Upload failed: " + err.message });
  }
});

// Upload multiple files
router.post("/multiple", protect, async (req, res) => {
  try {
    const { files } = req.body; // [{data, type}]
    if (!files || !files.length) {
      return res.status(400).json({ message: "No files provided" });
    }

    const results = await Promise.all(
      files.map(async (f) => {
        let resourceType = "image";
        if (f.type === "video") resourceType = "video";
        if (f.type === "voice") resourceType = "video";

        const result = await cloudinary.uploader.upload(f.data, {
          resource_type: resourceType,
          folder: "civicconnect/evidence",
        });
        return { url: result.secure_url, type: f.type };
      })
    );

    res.json(results);
  } catch (err) {
    console.error("Multi-upload error:", err.message);
    res.status(500).json({ message: "Upload failed: " + err.message });
  }
});

export default router;
