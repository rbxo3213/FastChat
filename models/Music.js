// models/Music.js

const mongoose = require("mongoose");

const MusicSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  filename: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  // 필요한 경우 추가 필드 작성
});

module.exports = mongoose.model("Music", MusicSchema);
