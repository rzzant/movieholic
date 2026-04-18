const express = require("express");
const router = express.Router();

// ✅ FIXED import (destructuring)
const { authMiddleware } = require("../middleware/authMiddleware");

const Review = require("../models/Review");

// Add review
router.post("/:movieId", authMiddleware, async (req, res) => {
  try {
    const review = new Review({
      user: req.user.id,
      movie: req.params.movieId,
      rating: req.body.rating,
      comment: req.body.comment
    });

    await review.save();

    res.json({ message: "Review added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get reviews
router.get("/:movieId", async (req, res) => {
  try {
    const reviews = await Review.find({ movie: req.params.movieId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;