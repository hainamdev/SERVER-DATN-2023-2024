require("dotenv").config();
require("./config/loginSalesforce");
const cors = require("cors");
const express = require("express");
const usersController = require("./controller/usersController");
const classController = require("./controller/classController");
const hocSinhController = require("./controller/hocSinhController");
const lessonController = require("./controller/lessonController");
const notificationController = require("./controller/notificationController");
const app = express();
const socketApi = require("./Socket");
const scoreController = require("./controller/scoreController");
const letterController = require("./controller/letterController");
const scheduleController = require("./controller/scheduleController");
const attendanceController = require("./controller/attendanceController");
const teacherController = require("./controller/teacherController");
const parentController = require("./controller/parentController");
// const io = require('socket.io')

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
app.get("/class", classController.getAllLop);

//-----------------------------STUDENT-----------------------------//
// lấy hoc sinh bằng Id
app.get("/student/:id", hocSinhController.getHocSinhByID);

//-----------------------------LESSON-----------------------------//
// lấy báo bài bằng Id lớp
app.get("/lesson/:idLop", lessonController.getAllLessonByIdLop);
app.get("/lesson/id/:id", lessonController.getAllLessonById);
app.post("/lesson/save", lessonController.createLesson);
app.post("/lesson/get-week", lessonController.getLessonWeek);
app.post("/lesson/delete", lessonController.deleteLesson);

//-----------------------------SCORE-----------------------------//
app.post("/score/import", scoreController.createImportScore);
app.post("/score/get-all-class", scoreController.getAllScore);
app.post("/score/get-score", scoreController.getScore);

//-----------------------------LETTER-----------------------------//
app.get("/letter/:id", letterController.getLetterByIDLop);
app.get("/letter/hocsinh/:id", letterController.getLetterByIDHocSinh);
app.post("/letter/save", letterController.saveLetter);

//-----------------------------NOTIFICATION-----------------------------//
app.post("/notification", notificationController.getAllNotificationByUserID);

//-----------------------------LETTER-----------------------------//
// /fruit/:fruitName&:fruitColor
// app.get("/schedule/:idClass", scheduleController.getScheduleByIdClass);
app.get("/schedule", scheduleController.getScheduleByIdClass);
app.post("/schedule/save", scheduleController.createSchedule);

//-----------------------------ATTENDANCEDAY-----------------------------//
app.get("/attendanceDay/classId/:id", attendanceController.getAllAttendanceDayById);
app.post("/attendanceDay/save", attendanceController.createAttendanceDay);

//-----------------------------TEACHER-----------------------------//
app.get("/teacher/", teacherController.getAllTeacher);
app.get("/teacher/:id", teacherController.getAllTeacherById);
app.post("/teacher/save", teacherController.createTeacher);

//-----------------------------TEACHER-----------------------------//
app.get("/parent/", parentController.getAllParent);
app.get("/parent/:id", parentController.getParentById);
app.post("/parent/save", parentController.createParent);

//-----------------------------SALESFORCE-----------------------------//
app.post("/notify/save-lesson-auto", (req, res) => {
  const { classID, lessonID } = req.body;
  socketApi.sendNotifyNewLesson({ classID, lessonID });
  return res.status(200).json({
    status: 200,
    message: 'SUCCCCCCCCCCCESS'
  });
});

module.exports = app;
