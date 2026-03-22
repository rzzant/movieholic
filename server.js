// ===============================
// FILE: server.js
// ===============================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import routes
const movieRoutes = require("./routes/movieRoutes");
const authRoutes = require("./routes/authRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");

const app = express();

// Middleware
app.use(cors());
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

// Watchlist (TMDB saves)
app.use("/api/watchlist", watchlistRoutes);

// Movie Routes
app.use("/movies", movieRoutes);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});