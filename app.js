require("dotenv").config();
require("./config/loginSalesforce");
const cors = require("cors");
const express = require("express");
const usersController = require("./controller/usersController");
const classController = require("./controller/classController");
const hocSinhController = require("./controller/hocSinhController");
const lessonController = require("./controller/lessonController");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cors());
const allowedOrigins = ["http://localhost:3000"];

// Config CORS
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
    allowedHeaders: "*",
    exposedHeaders: "*",
    credentials: true,
    maxAge: 86400,
    optionsSuccessStatus: 204,
  })
);

app.get("/", function (req, res) {
  res.json({ status: "online" });
});

//-----------------------------USER-----------------------------//
// Đăng nhập vào ứng dụng
app.post("/login", usersController.login);
// đăng kí user
app.post("/register", usersController.register);
// lấy tất cả  account
app.get("/users", usersController.getAllUser);
// lấy account bằng Id
app.get("/user/:id", usersController.getUserbyId);

//-----------------------------CLASS-----------------------------//
// lấy hoc sinh bằng Id Lớp
app.get("/class/:id", classController.getHocSinhByIDLop);

//-----------------------------STUDENT-----------------------------//
// lấy hoc sinh bằng Id
app.get("/student/:id", hocSinhController.getHocSinhByID);

//-----------------------------LESSON-----------------------------//
// lấy báo bài bằng Id lớp
app.get("/lesson/:idLop", lessonController.getAllLessonByIdLop);
app.post("/lesson/save", lessonController.createLesson);
app.post("/lesson/delete", lessonController.deleteLesson);

module.exports = app;
