const mongoose = require("mongoose");

const kinoSchema = new mongoose.Schema({
  movie_name: {
    type: String,
    required: true,
  },
  movie_id: {
    type: String || BigInt || Symbol || Number,
    required: true,
  },
  movie_url: {
    type: String,
    required: true,
  },
  adminId: {
    type: BigInt || Number,
    required: true,
  },
});

const kinoModel = mongoose.model("Movie", kinoSchema);

module.exports = kinoModel;
