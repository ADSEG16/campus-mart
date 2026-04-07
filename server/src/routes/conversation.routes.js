const express = require("express");
const router = express.Router();
const { startConversation } = require("../controllers/conversation.controller");
const { requireUser } = require("../middleware/auth.middleware");

router.post("/start", requireUser, startConversation);

module.exports = router;
