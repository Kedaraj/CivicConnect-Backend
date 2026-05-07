import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Incident from "../models/Incident.js";
import Alert from "../models/Alert.js";
import Complaint from "../models/Complaint.js";

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB for seeding...\n");

    // Clear existing data
    await Promise.all([User.deleteMany(), Incident.deleteMany(), Alert.deleteMany(), Complaint.deleteMany()]);
    console.log("🗑️  Cleared existing data");

    // ── Create Users ──
    const users = await User.create([
      { name: "Alex Johnson", email: "citizen@civic.com", password: "password123", role: "citizen", phone: "+91 98765 43210", stats: { reports: 12, resolved: 8, points: 340 } },
      { name: "Officer Raj Patel", email: "police@civic.com", password: "password123", role: "police", phone: "+91 98765 11111", badge: "TP-4521", stats: { reports: 0, resolved: 45, points: 1250 } },
      { name: "Dr. Priya Sharma", email: "ambulance@civic.com", password: "password123", role: "ambulance", phone: "+91 98765 22222", badge: "AMB-102", stats: { reports: 0, resolved: 32, points: 800 } },
      { name: "Eng. Vikram Singh", email: "construction@civic.com", password: "password123", role: "construction", phone: "+91 98765 33333", badge: "CON-207", stats: { reports: 0, resolved: 18, points: 450 } },
      { name: "Admin Kumar", email: "admin@civic.com", password: "password123", role: "admin", phone: "+91 98765 00000", stats: { reports: 0, resolved: 0, points: 5000 } },
      { name: "Sneha Reddy", email: "sneha@civic.com", password: "password123", role: "citizen", phone: "+91 98765 44444", stats: { reports: 5, resolved: 3, points: 120 } },
      { name: "Officer Meera Nair", email: "meera@civic.com", password: "password123", role: "police", phone: "+91 98765 55555", badge: "TP-3189", stats: { resolved: 28, points: 700 } },
    ]);
    console.log(`👥 Created ${users.length} users`);

    const citizen = users[0];
    const police = users[1];
    const citizen2 = users[5];

    // ── Create Incidents ──
    const incidents = await Incident.create([
      { type: "accident", title: "Accident — MG Road, Junction 4", description: "Two-vehicle collision blocking both lanes. Injuries reported.", location: { lat: 19.0728, lng: 72.8826, address: "MG Road, Junction 4" }, priority: "high", status: "open", reportedBy: citizen._id },
      { type: "traffic_jam", title: "Heavy Traffic — Highway 48", description: "Bumper-to-bumper traffic due to construction work.", location: { lat: 19.0802, lng: 72.8835, address: "Highway 48, Exit 12" }, priority: "medium", status: "in_progress", reportedBy: citizen._id, assignedTo: police._id },
      { type: "road_damage", title: "Road Blockage — Ring Road", description: "Large pothole causing traffic to divert. Needs immediate repair.", location: { lat: 19.0748, lng: 72.8795, address: "Ring Road, Section B" }, priority: "high", status: "open", reportedBy: citizen2._id },
      { type: "broken_signal", title: "Signal Down — Park Street", description: "Traffic signal malfunctioning. Officer needed for manual control.", location: { lat: 19.0710, lng: 72.8852, address: "Park Street Crossing" }, priority: "medium", status: "open", reportedBy: citizen._id },
      { type: "waterlogging", title: "Waterlogging — Andheri Subway", description: "Knee-deep water after heavy rain. Vehicles stuck.", location: { lat: 19.1136, lng: 72.8697, address: "Andheri Subway" }, priority: "high", status: "open", reportedBy: citizen2._id },
      { type: "illegal_parking", title: "Illegal Parking — Station Road", description: "Multiple vehicles parked on no-parking zone blocking traffic.", location: { lat: 19.0760, lng: 72.8777, address: "Station Road" }, priority: "low", status: "resolved", reportedBy: citizen._id, assignedTo: police._id, resolvedAt: new Date() },
      { type: "accident", title: "Minor Fender Bender — Bandra Link Road", description: "Minor collision, no injuries. Vehicles partially blocking left lane.", location: { lat: 19.0596, lng: 72.8295, address: "Bandra Link Road" }, priority: "low", status: "resolved", reportedBy: citizen2._id, resolvedAt: new Date() },
    ]);
    console.log(`🚨 Created ${incidents.length} incidents`);

    // ── Create Alerts ──
    const alerts = await Alert.create([
      { type: "accident", title: "Accident Detected", description: "Multi-vehicle accident at MG Road Junction 4. Emergency services en route.", severity: "high", location: { lat: 19.0728, lng: 72.8826, area: "MG Road, Junction 4" }, isActive: true, createdBy: police._id },
      { type: "traffic", title: "Heavy Traffic Ahead", description: "Expected delay of 25-30 minutes on Highway 48.", severity: "medium", location: { lat: 19.0802, lng: 72.8835, area: "Highway 48, Exit 12" }, isActive: true, createdBy: police._id },
      { type: "weather", title: "Rain Warning Issued", description: "Heavy rainfall expected. Waterlogging possible in low-lying areas.", severity: "low", location: { area: "Downtown District" }, isActive: true, createdBy: users[4]._id },
      { type: "police", title: "Road Blockage", description: "Road blocked for VIP movement. Use alternate routes.", severity: "high", location: { lat: 19.0748, lng: 72.8795, area: "Ring Road, Section B" }, isActive: true, createdBy: police._id },
      { type: "vip", title: "VIP Movement Alert", description: "Chief Minister convoy passing through Central Avenue. Expect delays.", severity: "medium", location: { area: "Central Avenue" }, isActive: true, createdBy: users[4]._id },
      { type: "police", title: "Police Checkpoint Active", description: "Routine document and sobriety check point.", severity: "low", location: { lat: 19.0680, lng: 72.8868, area: "North Bridge" }, isActive: true, createdBy: police._id },
      { type: "emergency", title: "Ambulance Route Active", description: "Emergency vehicle approaching. Please clear the way.", severity: "high", location: { area: "Kurla West to KEM Hospital" }, isActive: true, createdBy: users[2]._id },
    ]);
    console.log(`🔔 Created ${alerts.length} alerts`);

    // ── Create Complaints ──
    const complaints = await Complaint.create([
      { type: "pothole", title: "Dangerous Pothole on NH-48", description: "Deep pothole near Andheri flyover causing accidents.", location: { lat: 19.1136, lng: 72.8697, address: "NH-48, Andheri" }, priority: "high", status: "pending", submittedBy: citizen._id },
      { type: "signal", title: "Broken Traffic Signal", description: "Signal at Park Street junction non-functional for 3 days.", location: { lat: 19.0710, lng: 72.8852, address: "Park Street" }, priority: "medium", status: "reviewing", submittedBy: citizen2._id },
      { type: "parking", title: "No Parking Zone Violated", description: "Commercial vehicles regularly parking in residential area.", location: { address: "Dadar TT Circle" }, priority: "low", status: "in_progress", submittedBy: citizen._id, assignedTo: police._id },
      { type: "noise", title: "Construction Noise at Night", description: "Illegal construction work happening between 10PM-6AM.", location: { address: "Worli Sea Link Area" }, priority: "medium", status: "pending", submittedBy: citizen2._id },
    ]);
    console.log(`📝 Created ${complaints.length} complaints`);

    console.log("\n✅ Seed complete! Demo login credentials:");
    console.log("───────────────────────────────────────────");
    console.log("  Citizen:      citizen@civic.com / password123");
    console.log("  Police:       police@civic.com / password123");
    console.log("  Ambulance:    ambulance@civic.com / password123");
    console.log("  Construction: construction@civic.com / password123");
    console.log("  Admin:        admin@civic.com / password123");
    console.log("───────────────────────────────────────────\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
};

seed();
