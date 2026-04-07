const jwt = require("jsonwebtoken");
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const { encryptText } = require("../services/encryption.service");

const setupSocket = (io) => {
  // JWT authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // attach user info to socket

      next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.id);

    // --- Conversation Join ---
    socket.on("conversation:join", async ({ conversationId }, callback) => {
      try {
        if (!conversationId)
          return callback?.({
            ok: false,
            message: "conversationId is required",
          });

        const conversation = await Conversation.findById(conversationId);
        if (!conversation)
          return callback?.({ ok: false, message: "Conversation not found" });

        // Check participant (ObjectId -> string comparison)
        const isParticipant = conversation.participants.some(
          (id) => id.toString() === socket.user.id.toString(),
        );
        if (!isParticipant)
          return callback?.({ ok: false, message: "Not authorized" });

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

    // --- Conversation Leave ---
    socket.on("conversation:leave", ({ conversationId }, callback) => {
      if (!conversationId)
        return callback?.({ ok: false, message: "conversationId is required" });

      socket.leave(conversationId);
      console.log(`User ${socket.user.id} left conversation ${conversationId}`);

      return callback?.({
        ok: true,
        message: "Left conversation",
        conversationId,
      });
    });

    // --- Send Message ---
    socket.on("message:send", async ({ conversationId, text }, callback) => {
      try {
        if (!conversationId || !text)
          return callback?.({
            ok: false,
            message: "conversationId and text are required",
          });

        const conversation = await Conversation.findById(conversationId);
        if (!conversation)
          return callback?.({ ok: false, message: "Conversation not found" });

        const isParticipant = conversation.participants.some(
          (id) => id.toString() === socket.user.id.toString(),
        );
        if (!isParticipant)
          return callback?.({ ok: false, message: "Not authorized" });

        // Identify receiver
        const receiverId = conversation.participants.find(
          (id) => id.toString() !== socket.user.id.toString(),
        );
        if (!receiverId)
          return callback?.({ ok: false, message: "Receiver not found" });

        const encrypted = encryptText(text);

        const message = await Message.create({
          conversationId,
          senderId: socket.user.id,
          receiverId,
          ...encrypted,
          status: "sent",
        });

        // Update conversation lastMessage
        conversation.lastMessage = message._id;
        await conversation.save();

        // Broadcast new message to room
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

    // --- Mark Message Delivered ---
    socket.on("message:delivered", async ({ messageId }, callback) => {
      try {
        if (!messageId)
          return callback?.({ ok: false, message: "messageId is required" });

        const message = await Message.findById(messageId);
        if (!message)
          return callback?.({ ok: false, message: "Message not found" });

        // Only receiver can mark delivered
        if (message.receiverId.toString() !== socket.user.id.toString())
          return callback?.({ ok: false, message: "Not authorized" });

        if (message.status === "sent") {
          message.status = "delivered";
          message.deliveredAt = new Date();
          await message.save();

          // Notify sender
          io.to(message.conversationId.toString()).emit("message:status", {
            messageId: message._id,
            status: "delivered",
            deliveredAt: message.deliveredAt,
          });
        }

        return callback?.({ ok: true, message: "Delivered status updated" });
      } catch (err) {
        console.error("message:delivered error:", err);
        return callback?.({ ok: false, message: "Server error" });
      }
    });

    // --- Mark Message Read ---
    socket.on("message:read", async ({ messageId }, callback) => {
      try {
        if (!messageId)
          return callback?.({ ok: false, message: "messageId is required" });

        const message = await Message.findById(messageId);
        if (!message)
          return callback?.({ ok: false, message: "Message not found" });

        // Only receiver can mark read
        if (message.receiverId.toString() !== socket.user.id.toString())
          return callback?.({ ok: false, message: "Not authorized" });

        if (message.status !== "read") {
          message.status = "read";
          message.readAt = new Date();
          await message.save();

          // Notify sender
          io.to(message.conversationId.toString()).emit("message:status", {
            messageId: message._id,
            status: "read",
            readAt: message.readAt,
          });
        }

        return callback?.({ ok: true, message: "Read status updated" });
      } catch (err) {
        console.error("message:read error:", err);
        return callback?.({ ok: false, message: "Server error" });
      }
    });

    // --- Disconnect ---
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user.id);
    });
  });
};

module.exports = setupSocket;
