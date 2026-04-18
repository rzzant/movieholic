const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/authMiddleware");
 
const router = express.Router();
 
// ── Token helper ─────────────────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role ?? "user" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
 
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role ?? "user",
});
 
// ── REGISTER ─────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
 
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
 
    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
 
    // Enforce minimum password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
 
    const normalizedEmail = email.toLowerCase().trim();
 
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ message: "User already exists" });
    }
 
    const hashedPassword = await bcrypt.hash(password, 12);
 
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });
 
    const token = signToken(user);
 
    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    console.error("[register]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});
 
// ── LOGIN ─────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
 
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
 
    const user = await User.findOne({ email: email.toLowerCase().trim() });
 
    // Timing-safe: always run bcrypt even when user not found
    const passwordHash = user?.password ?? "$2b$12$invalidhashpadding000000000000000";
    const isMatch = await bcrypt.compare(password, passwordHash);
 
    if (!user || !isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
 
    const token = signToken(user);
 
    return res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});
 
// ── GET CURRENT USER ─────────────────────────────────────────────────────────
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
 
    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error("[me]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});
 
module.exports = router;