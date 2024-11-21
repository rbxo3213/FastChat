// app.js

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session"); // 추가
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const musicRouter = require("./routes/music");

// MongoDB 연결 설정 (mongoose 사용)
mongoose.connect("mongodb://localhost:27017/virtual-guitar", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads")); // 업로드된 파일 제공

// 세션 설정
app.use(
  session({
    secret: "your-secret-key", // 보안을 위해 환경 변수로 관리하는 것이 좋습니다.
    resave: false,
    saveUninitialized: true,
  })
);

// 뷰 엔진 설정
app.set("view engine", "ejs");

// 라우터 설정
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/music", musicRouter);

// 서버 시작
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
