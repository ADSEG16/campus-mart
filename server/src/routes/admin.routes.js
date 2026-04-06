const express = require('express');
const {
	getFlaggedUsers,
	getVerificationQueue,
	approveUserVerification,
	rejectUserVerification,
	getReportedReviews,
	resolveReviewReport,
	getAdminNotifications,
	getOrdersByStatusAnalytics,
	getCancellationsTrendAnalytics,
	getFlaggedUsersTrendAnalytics,
	exportOrdersByStatusCsv,
	exportFlaggedUsersCsv,
	exportReviewReportsCsv,
	exportModerationActivityCsv,
	getRecentModerationActivity,
	applyAdminComplaintPenalty,
	suspendUserAccount,
	removeListingByAdmin,
} = require('../controllers/admin.controller');
const { requireAdmin, requireUser } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/flagged-users', requireUser, requireAdmin, getFlaggedUsers);
router.get('/verification-queue', requireUser, requireAdmin, getVerificationQueue);
router.patch('/users/:userId/verify', requireUser, requireAdmin, approveUserVerification);
router.patch('/users/:userId/reject', requireUser, requireAdmin, rejectUserVerification);
router.patch('/users/:userId/complaint', requireUser, requireAdmin, applyAdminComplaintPenalty);
router.patch('/users/:userId/suspend', requireUser, requireAdmin, suspendUserAccount);
router.delete('/listings/:listingId', requireUser, requireAdmin, removeListingByAdmin);
router.get('/review-reports', requireUser, requireAdmin, getReportedReviews);
router.patch('/review-reports/:reviewId', requireUser, requireAdmin, resolveReviewReport);
router.get('/notifications', requireUser, requireAdmin, getAdminNotifications);
router.get('/analytics/orders-by-status', requireUser, requireAdmin, getOrdersByStatusAnalytics);
router.get('/analytics/orders-by-status/export.csv', requireUser, requireAdmin, exportOrdersByStatusCsv);
router.get('/analytics/flagged-users/export.csv', requireUser, requireAdmin, exportFlaggedUsersCsv);
router.get('/analytics/review-reports/export.csv', requireUser, requireAdmin, exportReviewReportsCsv);
router.get('/analytics/moderation-activity/export.csv', requireUser, requireAdmin, exportModerationActivityCsv);
router.get('/analytics/cancellations-trend', requireUser, requireAdmin, getCancellationsTrendAnalytics);
router.get('/analytics/flagged-users-trend', requireUser, requireAdmin, getFlaggedUsersTrendAnalytics);
router.get('/activity', requireUser, requireAdmin, getRecentModerationActivity);

module.exports = router;
