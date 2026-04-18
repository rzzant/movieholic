const express = require("express");
const router = express.Router();

// ✅ correct import (destructuring)
const { authMiddleware } = require("../middleware/authMiddleware");

const Watchlist = require("../models/WatchlistItem");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const watchlistCount = await Watchlist.countDocuments({
      user: req.user.id,
    });

    res.json({
      watchlistCount,
      message: "Dashboard data",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;