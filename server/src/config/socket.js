const jwt = require("jsonwebtoken");
const Conversation = require("../models/conversation");

const setupSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;

      next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.id);

    socket.on("conversation:join", async ({ conversationId }, callback) => {
      try {
        if (!conversationId) {
          return callback?.({
            ok: false,
            message: "conversationId is required",
          });
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          return callback?.({ ok: false, message: "Conversation not found" });
        }

        const isParticipant = conversation.participants.some(
          (id) => id.toString() === socket.user.id,
        );

        if (!isParticipant) {
          return callback?.({ ok: false, message: "Not authorized" });
        }

        socket.join(conversationId);

        console.log(
          `User ${socket.user.id} joined conversation ${conversationId}`,
        );

        return callback?.({
          ok: true,
          message: "Joined conversation",
          conversationId,
        });
      } catch (err) {
        console.error("conversation:join error:", err);
        return callback?.({ ok: false, message: "Server error" });
      }
    });

    socket.on("conversation:leave", ({ conversationId }, callback) => {
      if (!conversationId) {
        return callback?.({ ok: false, message: "conversationId is required" });
      }

      socket.leave(conversationId);

      console.log(`User ${socket.user.id} left conversation ${conversationId}`);

      return callback?.({
        ok: true,
        message: "Left conversation",
        conversationId,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user.id);
    });
  });
};

module.exports = setupSocket;
