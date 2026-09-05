import { io } from "socket.io-client";

const socketUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

const socket = io(socketUrl, {
  autoConnect: false,
});

export default socket;
