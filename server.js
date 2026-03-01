// ===============================
// FILE: server.js
// ===============================

const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

// Import routes
const movieRoutes = require("./routes/movieRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ DB Error:", err));

// Home Route
app.get("/", (req, res) => {
  res.send("🎬 Movieholic API running");
});

// Auth Routes
app.use("/api/auth", authRoutes);

// Movie Routes
app.use("/movies", movieRoutes);

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});