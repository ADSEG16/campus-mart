const express = require('express');
const {
	getFlaggedUsers,
	approveUserVerification,
	rejectUserVerification,
} = require('../controllers/admin.controller');
const { requireAdmin, requireUser } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/flagged-users', requireUser, requireAdmin, getFlaggedUsers);
router.patch('/users/:userId/verify', requireUser, requireAdmin, approveUserVerification);
router.patch('/users/:userId/reject', requireUser, requireAdmin, rejectUserVerification);

module.exports = router;
