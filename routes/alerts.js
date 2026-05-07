import { Router } from "express";
import { getAlerts, createAlert, updateAlert, resolveAlert, deleteAlert } from "../controllers/alertController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", getAlerts);                                                    // Public — view alerts
router.post("/", protect, authorize("police", "admin"), createAlert);          // Police/Admin — create
router.put("/:id", protect, authorize("police", "admin"), updateAlert);        // Police/Admin — update
router.put("/:id/resolve", protect, authorize("police", "admin"), resolveAlert); // Resolve alert
router.delete("/:id", protect, authorize("admin"), deleteAlert);               // Admin — delete

export default router;
