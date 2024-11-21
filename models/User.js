// models/User.js

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // 필요한 경우 추가 필드 작성
});

module.exports = mongoose.model("User", UserSchema);
