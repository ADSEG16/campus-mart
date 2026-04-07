const Conversation = require("../models/conversation");
const Order = require("../models/order.model");

/**
 * Get existing conversation between 2 users for a specific product, or create one.
 * This enforces one room per buyer-seller-product pair.
 */
async function getOrCreateConversation(userId1, userId2, productId = null, orderId = null) {
  // Ensure different users
  if (userId1.toString() === userId2.toString()) {
    throw new Error("Cannot create conversation with yourself");
  }

  let resolvedProductId = productId;
  let resolvedOrderId = orderId;

  if (!resolvedProductId && resolvedOrderId) {
    const order = await Order.findById(resolvedOrderId).select("items");
    resolvedProductId = order?.items?.[0]?.productId || null;
  }

  if (!resolvedProductId) {
    throw new Error("productId is required to create a conversation");
  }

  // Find existing conversation
  const baseFilter = {
    participants: { $all: [userId1, userId2] },
    productId: resolvedProductId,
  };

  let conversation = await Conversation.findOne(baseFilter);

  if (!conversation) {
    // Create new conversation
    conversation = await Conversation.create({
      participants: [userId1, userId2],
      productId: resolvedProductId,
      orderId: resolvedOrderId || null,
    });
  } else if (resolvedOrderId && String(conversation.orderId || "") !== String(resolvedOrderId)) {
    // Keep the room linked to the latest order context for this product thread.
    conversation.orderId = resolvedOrderId;
    await conversation.save();
  }

  return conversation;
}

async function listUserConversations(userId) {
  return Conversation.find({ participants: userId })
    .populate("participants", "_id fullName email profileImageUrl")
    .populate("productId", "_id title images price")
    .populate({
      path: "orderId",
      populate: {
        path: "items.productId",
        select: "_id title images price",
      },
    })
    .populate("lastMessage")
    .sort({ updatedAt: -1 });
}

module.exports = { getOrCreateConversation, listUserConversations };
