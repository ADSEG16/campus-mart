const jwt = require("jsonwebtoken");
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const { encryptText } = require("../services/encryption.service");

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

    // ✅ STEP 5: Send message
    socket.on("message:send", async ({ conversationId, text }, callback) => {
      try {
        if (!conversationId || !text) {
          return callback?.({
            ok: false,
            message: "conversationId and text are required",
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

        const receiverId = conversation.participants.find(
          (id) => id.toString() !== socket.user.id,
        );

        if (!receiverId) {
          return callback?.({ ok: false, message: "Receiver not found" });
        }

        const encrypted = encryptText(text);

        const message = await Message.create({
          conversationId,
          senderId: socket.user.id,
          receiverId,
          ...encrypted,
          status: "sent",
        });

        conversation.lastMessage = message._id;
        await conversation.save();

        io.to(conversationId).emit("message:new", {
          messageId: message._id,
          conversationId,
          senderId: socket.user.id,
          receiverId,
          createdAt: message.createdAt,
          status: message.status,
        });

        return callback?.({
          ok: true,
          message: "Message sent",
          messageId: message._id,
          status: message.status,
        });
      } catch (err) {
        console.error("message:send error:", err);
        return callback?.({ ok: false, message: "Server error" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user.id);
    });
  });
};

module.exports = setupSocket;
