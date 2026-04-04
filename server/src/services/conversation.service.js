const Conversation = require("../models/conversation");

/**
 * Get existing conversation between 2 users, or create one
 */
async function getOrCreateConversation(userId1, userId2) {
  // Ensure different users
  if (userId1.toString() === userId2.toString()) {
    throw new Error("Cannot create conversation with yourself");
  }

  // Find existing conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [userId1, userId2] },
  });

  if (!conversation) {
    // Create new conversation
    conversation = await Conversation.create({
      participants: [userId1, userId2],
    });
  }

  return conversation;
}

module.exports = { getOrCreateConversation };
