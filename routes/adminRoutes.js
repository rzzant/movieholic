const express = require("express");
const router = express.Router();

// ✅ FIXED import
const { authMiddleware } = require("../middleware/authMiddleware");

// GET /api/admin
router.get("/", authMiddleware, (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    res.status(200).json({
      message: "Welcome Admin",
      user: req.user
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;