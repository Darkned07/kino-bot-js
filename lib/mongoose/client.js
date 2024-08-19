const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  throw new Error("xatolik");
}

async function mongooseClient() {
  return await mongoose.connect(MONGO_URL);
}


module.exports = mongooseClient;
