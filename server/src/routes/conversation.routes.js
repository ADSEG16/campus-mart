const express = require("express");
const router = express.Router();
const {
	startConversation,
	getConversations,
	getConversationMessages,
} = require("../controllers/conversation.controller");
const { requireUser } = require("../middleware/auth.middleware");

router.get("/", requireUser, getConversations);
router.post("/start", requireUser, startConversation);
router.get("/:conversationId/messages", requireUser, getConversationMessages);

module.exports = router;
