const express = require("express");
const protect = require("../middleware/authMiddleware");
const WatchlistItem = require("../models/WatchlistItem");

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const items = await WatchlistItem.find({ user: req.user.id }).sort({
      createdAt: -1
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      tmdbId,
      title,
      posterPath,
      overview,
      voteAverage,
      releaseDate
    } = req.body;

    if (tmdbId == null || !title) {
      return res
        .status(400)
        .json({ message: "tmdbId and title are required" });
    }

    const existing = await WatchlistItem.findOne({
      user: req.user.id,
      tmdbId: Number(tmdbId)
    });
    if (existing) {
      return res.status(200).json(existing);
    }

    const item = await WatchlistItem.create({
      user: req.user.id,
      tmdbId: Number(tmdbId),
      title: String(title).trim(),
      posterPath: posterPath != null ? String(posterPath) : "",
      overview: overview != null ? String(overview) : "",
      voteAverage:
        voteAverage != null && !Number.isNaN(Number(voteAverage))
          ? Number(voteAverage)
          : 0,
      releaseDate: releaseDate != null ? String(releaseDate) : ""
    });

    res.status(201).json(item);
  } catch (err) {
    if (err.code === 11000) {
      const doc = await WatchlistItem.findOne({
        user: req.user.id,
        tmdbId: Number(req.body.tmdbId)
      });
      return res.status(200).json(doc);
    }
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:tmdbId", async (req, res) => {
  try {
    const tmdbId = Number(req.params.tmdbId);
    if (Number.isNaN(tmdbId)) {
      return res.status(400).json({ message: "Invalid tmdbId" });
    }

    const result = await WatchlistItem.findOneAndDelete({
      user: req.user.id,
      tmdbId
    });

    if (!result) {
      return res.status(404).json({ message: "Not in watchlist" });
    }

    res.json({ message: "Removed from watchlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
