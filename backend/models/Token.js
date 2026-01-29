const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  tokenId: String,
  name: String,
  mobile: String,
  totalCount: Number,
  remainingCount: Number,
  qrCode: String
});

module.exports = mongoose.model("Token", TokenSchema);
