const express = require('express');
const {
	getFlaggedUsers,
	approveUserVerification,
	rejectUserVerification,
	getOrdersByStatusAnalytics,
	getCancellationsTrendAnalytics,
	getFlaggedUsersTrendAnalytics,
	exportOrdersByStatusCsv,
} = require('../controllers/admin.controller');
const { requireAdmin, requireUser } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/flagged-users', requireUser, requireAdmin, getFlaggedUsers);
router.patch('/users/:userId/verify', requireUser, requireAdmin, approveUserVerification);
router.patch('/users/:userId/reject', requireUser, requireAdmin, rejectUserVerification);
router.get('/analytics/orders-by-status', requireUser, requireAdmin, getOrdersByStatusAnalytics);
router.get('/analytics/orders-by-status/export.csv', requireUser, requireAdmin, exportOrdersByStatusCsv);
router.get('/analytics/cancellations-trend', requireUser, requireAdmin, getCancellationsTrendAnalytics);
router.get('/analytics/flagged-users-trend', requireUser, requireAdmin, getFlaggedUsersTrendAnalytics);

module.exports = router;
