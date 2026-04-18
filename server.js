// ── Fail fast if critical env vars are missing ──────────────────────────────
// (Do this before any other requires that might use them)
require("dotenv").config();
if (!process.env.MONGO_URI)  throw new Error("FATAL: MONGO_URI is not set");
if (!process.env.JWT_SECRET) throw new Error("FATAL: JWT_SECRET is not set");
 
const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
 
// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes      = require("./routes/authRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const reviewRoutes    = require("./routes/reviewRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes     = require("./routes/adminRoutes");
 
const app = express();
 
// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());                    // sets secure HTTP headers
app.use(mongoSanitize());             // strips $ and . from req.body / query (NoSQL injection)
 
// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
 
// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // prevent oversized payloads
 
// ── Rate limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});
 
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // stricter on auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later" },
});
 
app.use(globalLimiter);
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);
 
// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });
 
// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => res.send("🎬 Movieholic API running"));
 
app.use("/api/auth",      authRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/reviews",   reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin",     adminRoutes);
 
// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
 
// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status ?? 500).json({ message: err.message || "Internal server error" });
});
 
// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));