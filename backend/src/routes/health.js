const express = require('express');
const mongoose = require('mongoose');


const router = express.Router();

router.get("/", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];

  res.json({
    states: 'Ok',
    uptime: process.uptime(),
    db: states[mongoose.connection.readyState] || "Unknown",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
