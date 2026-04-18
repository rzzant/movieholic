const express = require("express");
const router = express.Router();

// ✅ FIXED import
const { authMiddleware } = require("../middleware/authMiddleware");

const Movie = require("../models/Movie");

/* ===========================
   CREATE MOVIE
=========================== */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, genre, rating } = req.body;

    const movie = await Movie.create({
      title,
      genre,
      rating,
      user: req.user.id
    });

    res.status(201).json(movie);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ===========================
   GET ALL MOVIES
=========================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const movies = await Movie.find({ user: req.user.id });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===========================
   GET SINGLE MOVIE
=========================== */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json(movie);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===========================
   UPDATE MOVIE
=========================== */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json(movie);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ===========================
   DELETE MOVIE
=========================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json({ message: "Movie deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===========================
   ADD REVIEW
=========================== */
router.post("/:id/reviews", authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const alreadyReviewed = movie.reviews.find(
      (r) => r.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Movie already reviewed" });
    }

    const review = {
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    movie.reviews.push(review);

    movie.numReviews = movie.reviews.length;

    movie.rating =
      movie.reviews.reduce((acc, item) => acc + item.rating, 0) /
      movie.reviews.length;

    await movie.save();

    res.status(201).json({ message: "Review added successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;