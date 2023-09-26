const { Server } = require("socket.io");

let io = new Server({
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
    allowedHeaders: "*",
    exposedHeaders: "*",
    credentials: true,
  },
});

const socketApi = { io: io };

io.on("connection", (socket) => {
  console.log("a user " + socket.id + " Connected!");

  socket.on("Client-sent-data", (data) => {
    console.log("client send data", data);
    socket.emit("Server-sent-data", data);
  });

  // when disconnect
  socket.on("disconnect", (socket) => {
    console.log("a user " + socket.id + " disconnected!");
  });
});

module.exports = socketApi;
