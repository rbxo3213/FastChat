// routes/index.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/play", (req, res) => {
  res.render("play");
});

router.get("/settings", (req, res) => {
  res.render("settings");
});

module.exports = router;
