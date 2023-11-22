const socketIO = require("socket.io");

function createSocketServer(server) {
  const io = socketIO(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("user connected");
  });
  return io;
}

module.exports = { createSocketServer };
