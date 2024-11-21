// routes/users.js

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Music = require("../models/Music"); // 추가
const bcrypt = require("bcrypt");

// 회원가입 페이지
router.get("/register", (req, res) => {
  res.render("register");
});

// 회원가입 처리
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hash });
  try {
    await user.save();
    res.redirect("/users/login");
  } catch (err) {
    res.status(500).send("회원가입 중 오류 발생");
  }
});

// 로그인 페이지
router.get("/login", (req, res) => {
  res.render("login");
});

// 로그인 처리
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && (await bcrypt.compare(password, user.password))) {
    // 세션 처리
    req.session.userId = user._id;
    res.redirect("/");
  } else {
    res.status(400).send("아이디 또는 비밀번호가 잘못되었습니다.");
  }
});

router.get("/profile", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/users/login");
  }
  const user = await User.findById(req.session.userId);
  const musics = await Music.find({ user: user._id });
  res.render("profile", { user, musics });
});

module.exports = router;
