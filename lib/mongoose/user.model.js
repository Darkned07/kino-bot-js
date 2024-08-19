const mongoose = require("mongoose");

const userScheme = new mongoose.Schema({
  chatId: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
  },
  username: {
    type: String,
    required: true,
  },
});

const userModel = mongoose.model("User", userScheme);

module.exports = userModel;
