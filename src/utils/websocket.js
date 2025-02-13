import io from "socket.io-client";

let socket = null;

export const initializeSocket = (token) => {
  if (socket) return socket;

  socket = io("http://localhost:1337", {
    auth: { token },
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("Connected to WebSocket server");
  });

  socket.on("connect_error", (error) => {
    console.error("WebSocket connection error:", error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const sendMessage = (content) => {
  if (socket) {
    socket.emit("sendMessage", { content });
  }
};

export default {
  initializeSocket,
  disconnectSocket,
  sendMessage,
};
