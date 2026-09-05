const http = require("http");
const { Server } = require("socket.io");
const { initializeSocket } = require("./socket");

const app = require("./app");
const { connectRedis } = require("./redis");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectRedis();

    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
    });

    initializeSocket(io);

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      socket.emit("connected", {
        success: true,
        message: "Connected to TaskFlow realtime server",
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });

    httpServer.listen(PORT, () => {
      console.log(`TaskFlow server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
