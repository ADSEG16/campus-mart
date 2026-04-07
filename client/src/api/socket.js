import { io } from "socket.io-client";
import { getApiBaseUrl } from "./http";

let socketInstance = null;
const messageListeners = new Set();

const toSocketBaseUrl = () => {
  const apiBase = getApiBaseUrl();
  return apiBase.endsWith("/api") ? apiBase.slice(0, -4) : apiBase;
};

export const getSocket = (token) => {
  if (socketInstance) {
    if (token) {
      socketInstance.auth = { token };
    }
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    return socketInstance;
  }

  socketInstance = io(toSocketBaseUrl(), {
    autoConnect: true,
    auth: token ? { token } : {},
    transports: ["websocket", "polling"],
  });

  socketInstance.on("message:new", (payload) => {
    messageListeners.forEach((listener) => {
      try {
        listener(payload);
      } catch {
        // Ignore listener failures to avoid breaking socket event loop.
      }
    });
  });

  return socketInstance;
};

export const onSocketMessage = (listener) => {
  messageListeners.add(listener);
  return () => {
    messageListeners.delete(listener);
  };
};
