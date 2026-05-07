import { Router } from "express";
import { getComplaints, createComplaint, updateComplaint, deleteComplaint } from "../controllers/complaintController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getComplaints);                                              // Auth — view (citizens see own, admin sees all)
router.post("/", protect, createComplaint);                                           // Auth — submit complaint
router.put("/:id", protect, authorize("police", "construction", "admin"), updateComplaint); // Authorized roles — update
router.delete("/:id", protect, authorize("admin"), deleteComplaint);                  // Admin — delete

export default router;
