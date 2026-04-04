const { getOrCreateConversation } = require("../services/conversation.service");

async function startConversation(req, res) {
  try {
    const { recipientId } = req.body;
    const senderId = req.user.id; // assume JWT auth middleware sets req.user

    const conversation = await getOrCreateConversation(senderId, recipientId);

    res.status(200).json({ success: true, conversation });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

module.exports = { startConversation };
