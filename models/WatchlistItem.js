const mongoose = require("mongoose");
 
const watchlistItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tmdbId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    posterPath: {
      type: String,
      default: "",
    },
    overview: {
      type: String,
      default: "",
    },
    voteAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    releaseDate: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);
 
// Compound unique index — prevents duplicate watchlist entries per user
watchlistItemSchema.index({ user: 1, tmdbId: 1 }, { unique: true });
 
module.exports = mongoose.model("WatchlistItem", watchlistItemSchema);