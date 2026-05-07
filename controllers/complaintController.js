import Complaint from "../models/Complaint.js";

// @route   GET /api/complaints
export const getComplaints = async (req, res) => {
  try {
    const { type, status, priority } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Citizens see only their own; police/admin see all
    if (req.user.role === "citizen") filter.submittedBy = req.user._id;

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("submittedBy", "name email avatar")
      .populate("assignedTo", "name role");

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   POST /api/complaints
export const createComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.create({ ...req.body, submittedBy: req.user._id });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   PUT /api/complaints/:id
export const updateComplaint = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.status === "resolved") updates.resolvedAt = new Date();
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("submittedBy", "name email")
      .populate("assignedTo", "name role");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   DELETE /api/complaints/:id
export const deleteComplaint = async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: "Complaint deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
