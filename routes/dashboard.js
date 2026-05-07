import { Router } from "express";
import { getStats, getAnalytics } from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/stats", protect, authorize("citizen", "police", "ambulance", "construction", "admin"), getStats);
router.get("/analytics", protect, authorize("admin"), getAnalytics);

export default router;
