const { Server } = require("socket.io");
const uuid = require("uuid");

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: "*",
    exposedHeaders: "*",
  },
  allowEIO3: true,
});
// let io = new Server({
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
//     allowedHeaders: "*",
//     exposedHeaders: "*",
//     credentials: true,
//   },
// });

const socketApi = { io: io };
_roomOfClass = new Map();
_teacher = new Map();

const addTeacher = (userId, socket) => {
  var tmp = _teacher.get(userId);
  if (tmp) {
    socket.join(tmp);
  } else {
    const roomId = uuid.v4();
    socket.join(roomId);
    _teacher.set(userId, roomId);
  }
};

const addRoomOfClass = (classId, socket) => {
  var tmp = _roomOfClass.get(classId);
  if (tmp) {
    socket.join(tmp);
  } else {
    const roomId = uuid.v4();
    socket.join(roomId);
    _roomOfClass.set(classId, roomId);
  }
};

io.on("connection", (socket) => {
  console.log("a user " + socket.id + " Connected!");

  socket.on("addTeacher", (data) => {
    const { senderId } = data;
    if (senderId && senderId !== "") addTeacher(senderId, socket);
    console.log(_teacher);
  });

  socket.on("addParent", (data) => {
    const { classId } = data;
    if (classId && classId !== "") addRoomOfClass(classId, socket);
    console.log(_roomOfClass);
  });

  socket.on("add-lesson-complete", (data) => {
    const { classId, lessonId } = data;
    socket
      .to(_roomOfClass.get(classId))
      .emit("notify-new-lesson", { classId, lessonId });
    console.log("classId: " + classId);
    console.log("lessonId: " + lessonId);
  });

  // when disconnect
  socket.on("disconnect", (socket) => {
    console.log("a user " + socket.id + " disconnected!");
  });
});

module.exports = socketApi;
