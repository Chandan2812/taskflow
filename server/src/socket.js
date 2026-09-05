let io;

function initializeSocket(socketIO) {
  io = socketIO;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.IO is not initialized");
  }

  return io;
}

module.exports = {
  initializeSocket,
  getIO,
};
