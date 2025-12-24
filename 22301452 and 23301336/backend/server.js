const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const activityRoutes = require("./routes/activityRoutes");
const path = require("path");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// serve uploads statically (already implemented? ensure path is correct)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// use activities route
app.use("/api/activities", activityRoutes);

// Enable CORS - MUST BE FIRST
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const authRoutes = require("./routes/authRoutes");
const childRoutes = require("./routes/childRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const staffActivityRoutes = require("./routes/staffActivityRoutes");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/children", childRoutes);
app.use("/api/users", userRoutes);
app.use("/api/staff-activities", staffActivityRoutes);
app.use("/api/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Smart Daycare Management API is running!",
    version: "1.0.0",
    project: "Smart Daycare Management and Parent Monitoring System",
    availableEndpoints: {
      auth: "/api/auth",
      children: "/api/children",
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Server Error",
    message: err.message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("================================");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);

  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Children: http://localhost:${PORT}/api/children`);
  console.log("================================");
});
