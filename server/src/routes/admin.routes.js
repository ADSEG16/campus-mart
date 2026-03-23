const express = require('express');
const { getFlaggedUsers } = require('../controllers/admin.controller');
const { requireAdmin, requireUser } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/flagged-users', requireUser, requireAdmin, getFlaggedUsers);

module.exports = router;