import { Router } from "express";
import { getIncidents, getIncident, createIncident, updateIncident, deleteIncident } from "../controllers/incidentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", getIncidents);                                          // Public — view all incidents
router.get("/:id", getIncident);                                        // Public — view single incident
router.post("/", protect, createIncident);                              // Auth — create incident
router.put("/:id", protect, authorize("police", "admin"), updateIncident);   // Police/Admin — update
router.delete("/:id", protect, authorize("admin"), deleteIncident);     // Admin — delete

export default router;
