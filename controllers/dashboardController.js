import Incident from "../models/Incident.js";
import Alert from "../models/Alert.js";
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

// @route   GET /api/dashboard/stats
export const getStats = async (req, res) => {
  try {
    const [
      totalIncidents,
      openIncidents,
      resolvedIncidents,
      totalAlerts,
      activeAlerts,
      totalComplaints,
      pendingComplaints,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      Incident.countDocuments(),
      Incident.countDocuments({ status: "open" }),
      Incident.countDocuments({ status: "resolved" }),
      Alert.countDocuments(),
      Alert.countDocuments({ isActive: true }),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "pending" }),
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
    ]);

    // Incidents by type
    const incidentsByType = await Incident.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Incidents by priority
    const incidentsByPriority = await Incident.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    // Recent incidents (last 24h)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentIncidents = await Incident.countDocuments({ createdAt: { $gte: last24h } });

    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    res.json({
      incidents: { total: totalIncidents, open: openIncidents, resolved: resolvedIncidents, recent24h: recentIncidents, byType: incidentsByType, byPriority: incidentsByPriority },
      alerts: { total: totalAlerts, active: activeAlerts },
      complaints: { total: totalComplaints, pending: pendingComplaints },
      users: { total: totalUsers, active: activeUsers, byRole: usersByRole },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/dashboard/analytics
export const getAnalytics = async (req, res) => {
  try {
    // Incidents over last 7 days
    const days = 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyIncidents = await Incident.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Top reporters
    const topReporters = await User.find()
      .sort({ "stats.reports": -1 })
      .limit(5)
      .select("name role stats.reports stats.points avatar");

    // Hotspots (locations with most incidents)
    const hotspots = await Incident.aggregate([
      { $group: { _id: "$location.address", count: { $sum: 1 }, lat: { $first: "$location.lat" }, lng: { $first: "$location.lng" } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({ dailyIncidents, topReporters, hotspots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
