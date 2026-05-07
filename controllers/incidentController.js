import Incident from "../models/Incident.js";
import User from "../models/User.js";

// @route   GET /api/incidents
export const getIncidents = async (req, res) => {
  try {
    const { type, status, priority, limit = 50 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const incidents = await Incident.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate("reportedBy", "name role avatar")
      .populate("assignedTo", "name role");

    res.json(incidents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/incidents/:id
export const getIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate("reportedBy", "name role avatar email")
      .populate("assignedTo", "name role");
    if (!incident) return res.status(404).json({ message: "Incident not found" });
    res.json(incident);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   POST /api/incidents
export const createIncident = async (req, res) => {
  try {
    const incident = await Incident.create({
      ...req.body,
      reportedBy: req.user._id,
    });

    // Increment user's report count
    await User.findByIdAndUpdate(req.user._id, { $inc: { "stats.reports": 1, "stats.points": 10 } });

    const populated = await incident.populate("reportedBy", "name role avatar");

    // Broadcast to all connected clients (police dashboard will pick this up)
    const io = req.app.get("io");
    if (io) {
      io.emit("incident-update", { type: "new", incident: populated });
      io.emit("alert-update", { type: "new-incident", incident: populated });
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   PUT /api/incidents/:id
export const updateIncident = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.status === "resolved") updates.resolvedAt = new Date();

    const incident = await Incident.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("reportedBy", "name role avatar")
      .populate("assignedTo", "name role");

    if (!incident) return res.status(404).json({ message: "Incident not found" });

    // Award points if resolved
    if (updates.status === "resolved" && incident.assignedTo) {
      await User.findByIdAndUpdate(incident.assignedTo._id, { $inc: { "stats.resolved": 1, "stats.points": 25 } });
    }

    res.json(incident);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   DELETE /api/incidents/:id
export const deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) return res.status(404).json({ message: "Incident not found" });
    res.json({ message: "Incident deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
