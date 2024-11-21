// routes/music.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Music = require("../models/Music"); // 추가

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // 업로드 폴더
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + path.extname(file.originalname);
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("audio"), async (req, res) => {
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ success: false, message: "로그인이 필요합니다." });
  }

  const music = new Music({
    user: req.session.userId,
    filename: req.file.filename,
  });

  try {
    await music.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "음악 저장 중 오류 발생" });
  }
});

module.exports = router;
