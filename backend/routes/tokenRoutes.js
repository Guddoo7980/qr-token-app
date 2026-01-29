const express = require("express");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const Token = require("../models/Token");

const router = express.Router();

/* Generate Token */
router.post("/generate", async (req, res) => {
  try {
    const { name, mobile, count } = req.body;

    if (!name || !mobile || !count) {
      return res.status(400).json({ message: "All fields required" });
    }

    const tokenId = uuidv4().slice(0, 8).toUpperCase();
    const qrCode = await QRCode.toDataURL(tokenId);

    const token = await Token.create({
      tokenId,
      name,
      mobile,
      totalCount: Number(count),
      remainingCount: Number(count),
      qrCode
    });

    res.json(token);
  } catch (err) {
    res.status(500).json({ message: "Error generating token" });
  }
});

/* Scan Token */
router.post("/scan", async (req, res) => {
  try {
    const { tokenId, scanCount } = req.body;

    const token = await Token.findOne({ tokenId });
    if (!token) return res.status(404).json({ message: "Invalid token" });

    if (token.remainingCount <= 0) {
      return res.json({ status: "expired", token });
    }

    token.remainingCount -= Number(scanCount);
    if (token.remainingCount < 0) token.remainingCount = 0;

    await token.save();

    res.json({
      status: token.remainingCount > 0 ? "valid" : "expired",
      token
    });
  } catch (err) {
    res.status(500).json({ message: "Scan failed" });
  }
});

module.exports = router;
