const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true },
);

// Index participants for fast lookup (e.g., find conversation between 2 users)
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
