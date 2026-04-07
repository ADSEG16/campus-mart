const Message = require("../models/message");
const Conversation = require("../models/conversation");
const {
  getOrCreateConversation,
  listUserConversations,
} = require("../services/conversation.service");

const safeDecryptText = (payload) => {
  try {
    const { decryptText } = require("../services/encryption.service");
    return decryptText(payload);
  } catch {
    return "[Encrypted message unavailable]";
  }
};

async function startConversation(req, res) {
  try {
    const { recipientId, productId, orderId } = req.body;
    const senderId = req.user.id; // assume JWT auth middleware sets req.user

    const conversation = await getOrCreateConversation(senderId, recipientId, productId || null, orderId || null);

    res.status(200).json({ success: true, conversation });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function getConversations(req, res) {
  try {
    const conversations = await listUserConversations(req.user.id);
    return res.status(200).json({ success: true, conversations });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch conversations" });
  }
}

async function getConversationMessages(req, res) {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === req.user.id.toString(),
    );

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (conversation.expiresAt && new Date(conversation.expiresAt).getTime() <= Date.now()) {
      return res.status(410).json({ success: false, message: "Conversation has expired" });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    const safeMessages = messages.map((message) => ({
      _id: message._id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      receiverId: message.receiverId,
      text: safeDecryptText({
        ciphertext: message.ciphertext,
        iv: message.iv,
        authTag: message.authTag,
      }),
      status: message.status,
      deliveredAt: message.deliveredAt,
      readAt: message.readAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }));

    return res.status(200).json({ success: true, messages: safeMessages });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
}

module.exports = { startConversation, getConversations, getConversationMessages };
