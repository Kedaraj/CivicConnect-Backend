import Alert from "../models/Alert.js";

// @route   GET /api/alerts
export const getAlerts = async (req, res) => {
  try {
    const { type, active, severity } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (active !== undefined) filter.isActive = active === "true";
    if (severity) filter.severity = severity;

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("createdBy", "name role");

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   POST /api/alerts
export const createAlert = async (req, res) => {
  try {
    const alert = await Alert.create({ ...req.body, createdBy: req.user._id });
    const populated = await alert.populate("createdBy", "name role");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   PUT /api/alerts/:id
export const updateAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   PUT /api/alerts/:id/resolve
export const resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   DELETE /api/alerts/:id
export const deleteAlert = async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: "Alert deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
