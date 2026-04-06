const User = require('../models/user.model');
const Order = require('../models/order.model');
const AuditEvent = require('../models/auditEvent.model');
const Product = require('../models/product.model');
const Review = require('../models/review.model');
const mongoose = require('mongoose');
const { updateUserTrustScore, TRUST_SCORE_RULES } = require('../services/trustScore.service');
const { ORDER_STATUS } = require('../constants/order.status');
const { sendSuccess, sendError } = require('../utils/response');

const getTrendWindowDays = (value, fallback = 7) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, 90);
};

const getWindowStart = (days) => {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
};

const escapeCsvValue = (value) => {
  const raw = value === null || value === undefined ? '' : String(value);
  if (!/[",\n]/.test(raw)) {
    return raw;
  }

  return `"${raw.replace(/"/g, '""')}"`;
};

const toCsv = (headers, rows) => {
  const headLine = headers.join(',');
  const bodyLines = rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(','));
  return `${[headLine, ...bodyLines].join('\n')}\n`;
};

const getFlaggedUsers = async (req, res, next) => {
  try {
    const users = await User.find({ flagged: true })
      .select('_id email role flagged createdAt updatedAt')
      .sort({ updatedAt: -1 });

    return sendSuccess(res, {
      message: 'Flagged users fetched successfully',
      data: users,
      pagination: {
        page: 1,
        limit: users.length,
        total: users.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
      extras: {
        count: users.length,
        users,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getVerificationQueue = async (req, res, next) => {
  try {
    const users = await User.find({
      verificationStatus: 'pending',
      studentIdUrl: { $ne: null },
    })
      .select('_id fullName email department graduationYear verificationStatus studentIdUrl trustScore createdAt updatedAt')
      .sort({ updatedAt: -1 });

    return sendSuccess(res, {
      message: 'Verification queue fetched successfully',
      data: users,
      pagination: {
        page: 1,
        limit: users.length,
        total: users.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
      extras: {
        count: users.length,
        users,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const approveUserVerification = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found' });
    }

    if (!user.studentIdUrl) {
      return sendError(res, {
        statusCode: 400,
        message: 'User has not uploaded a student ID document',
      });
    }

    user.verificationStatus = 'verified';
    user.isVerified = true;
    await user.save();
    await AuditEvent.create({
      eventType: 'moderation.verification_approved',
      actorId: req.user._id,
      entityType: 'user',
      entityId: user._id,
      payload: {
        verificationStatus: user.verificationStatus,
        isVerified: user.isVerified,
      },
    });

    return sendSuccess(res, {
      message: 'User verification approved successfully',
      data: User.sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const rejectUserVerification = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found' });
    }

    user.verificationStatus = 'rejected';
    user.isVerified = false;
    await user.save();
    await AuditEvent.create({
      eventType: 'moderation.verification_rejected',
      actorId: req.user._id,
      entityType: 'user',
      entityId: user._id,
      payload: {
        verificationStatus: user.verificationStatus,
        isVerified: user.isVerified,
      },
    });

    return sendSuccess(res, {
      message: 'User verification rejected successfully',
      data: User.sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const getOrdersByStatusAnalytics = async (req, res, next) => {
  try {
    const metrics = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
      {
        $sort: {
          status: 1,
        },
      },
    ]);

    return sendSuccess(res, {
      message: 'Orders by status analytics fetched successfully',
      data: metrics,
      extras: {
        totalStatuses: metrics.length,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getCancellationsTrendAnalytics = async (req, res, next) => {
  try {
    const days = getTrendWindowDays(req.query.days);
    const windowStart = getWindowStart(days);

    const trend = await Order.aggregate([
      {
        $match: {
          status: { $in: [ORDER_STATUS.CANCELLED, 'Cancelled'] },
          updatedAt: { $gte: windowStart },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$updatedAt',
              timezone: 'UTC',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);

    return sendSuccess(res, {
      message: 'Cancellations trend analytics fetched successfully',
      data: trend,
      extras: {
        days,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getFlaggedUsersTrendAnalytics = async (req, res, next) => {
  try {
    const days = getTrendWindowDays(req.query.days);
    const windowStart = getWindowStart(days);

    const trend = await User.aggregate([
      {
        $match: {
          flagged: true,
          updatedAt: { $gte: windowStart },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$updatedAt',
              timezone: 'UTC',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);

    return sendSuccess(res, {
      message: 'Flagged users trend analytics fetched successfully',
      data: trend,
      extras: {
        days,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const exportOrdersByStatusCsv = async (req, res, next) => {
  try {
    const metrics = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
      {
        $sort: {
          status: 1,
        },
      },
    ]);

    const lines = ['status,count', ...metrics.map((row) => `${row.status},${row.count}`)];
    const csv = `${lines.join('\n')}\n`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="orders-by-status.csv"');

    return res.status(200).send(csv);
  } catch (error) {
    return next(error);
  }
};

const getRecentModerationActivity = async (req, res, next) => {
  try {
    const events = await AuditEvent.find({
      eventType: { $in: [
        'moderation.verification_approved',
        'moderation.verification_rejected',
        'admin.complaint_penalty_applied',
        'admin.account_suspended',
        'admin.listing_removed',
      ] },
    })
      .populate('actorId', '_id fullName email role')
      .sort({ createdAt: -1 })
      .limit(12);

    return sendSuccess(res, {
      message: 'Recent moderation activity fetched successfully',
      data: events,
      extras: {
        count: events.length,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getReportedReviews = async (req, res, next) => {
  try {
    const statusQuery = String(req.query.status || 'pending').trim().toLowerCase();
    const statusFilter = ['pending', 'dismissed', 'actioned'].includes(statusQuery)
      ? statusQuery
      : 'pending';

    const reviews = await Review.find({
      'report.isReported': true,
      ...(statusFilter === 'all' ? {} : { 'report.status': statusFilter }),
    })
      .populate('reviewerId', '_id fullName email')
      .populate('revieweeId', '_id fullName email')
      .populate('report.reportedBy', '_id fullName email role')
      .sort({ 'report.reportedAt': -1, updatedAt: -1 })
      .limit(100);

    return sendSuccess(res, {
      message: 'Reported reviews fetched successfully',
      data: reviews,
      extras: {
        count: reviews.length,
        status: statusFilter,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const resolveReviewReport = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { action, adminNote } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(String(reviewId || ''))) {
      return sendError(res, { statusCode: 400, message: 'Invalid reviewId' });
    }

    if (!['dismissed', 'actioned'].includes(String(action || '').trim().toLowerCase())) {
      return sendError(res, { statusCode: 400, message: 'action must be either dismissed or actioned' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return sendError(res, { statusCode: 404, message: 'Review not found' });
    }

    if (!review.report?.isReported) {
      return sendError(res, { statusCode: 409, message: 'Review has not been reported' });
    }

    review.report.status = String(action).toLowerCase();
    review.report.adminNote = typeof adminNote === 'string' ? adminNote.trim() : '';
    review.report.resolvedBy = req.user._id;
    review.report.resolvedAt = new Date();

    await review.save();

    await AuditEvent.create({
      eventType: 'review.report_resolved',
      actorId: req.user._id,
      entityType: 'order',
      entityId: review.orderId,
      payload: {
        reviewId: review._id,
        action: review.report.status,
        adminNote: review.report.adminNote,
      },
    });

    return sendSuccess(res, {
      message: 'Review report resolved successfully',
      data: review,
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminNotifications = async (req, res, next) => {
  try {
    const now = new Date();
    const weekStart = getWindowStart(7);

    const [
      verificationQueueCount,
      flaggedUsersCount,
      reportedReviewsCount,
      cancelledOrdersWeek,
      moderationActionsWeek,
    ] = await Promise.all([
      User.countDocuments({ verificationStatus: 'pending', studentIdUrl: { $ne: null } }),
      User.countDocuments({ flagged: true }),
      Review.countDocuments({ 'report.isReported': true, 'report.status': 'pending' }),
      Order.countDocuments({ status: { $in: [ORDER_STATUS.CANCELLED, 'Cancelled'] }, updatedAt: { $gte: weekStart } }),
      AuditEvent.countDocuments({
        eventType: {
          $in: [
            'moderation.verification_approved',
            'moderation.verification_rejected',
            'admin.complaint_penalty_applied',
            'admin.account_suspended',
            'admin.listing_removed',
            'review.report_resolved',
          ],
        },
        createdAt: { $gte: weekStart, $lte: now },
      }),
    ]);

    const notifications = [];

    if (verificationQueueCount > 0) {
      notifications.push({
        id: 'verification-queue',
        severity: verificationQueueCount > 10 ? 'warning' : 'info',
        title: 'Verification queue pending',
        message: `${verificationQueueCount} student verification requests are waiting for review.`,
        metric: verificationQueueCount,
        targetTab: 'verification',
        createdAt: now,
      });
    }

    if (reportedReviewsCount > 0) {
      notifications.push({
        id: 'reported-reviews',
        severity: reportedReviewsCount > 5 ? 'warning' : 'info',
        title: 'Reported reviews need moderation',
        message: `${reportedReviewsCount} reviews were reported as abusive and are pending admin action.`,
        metric: reportedReviewsCount,
        targetTab: 'reviews',
        createdAt: now,
      });
    }

    if (flaggedUsersCount > 0) {
      notifications.push({
        id: 'flagged-users',
        severity: flaggedUsersCount > 5 ? 'warning' : 'info',
        title: 'Flagged users require follow-up',
        message: `${flaggedUsersCount} accounts are currently flagged.`,
        metric: flaggedUsersCount,
        targetTab: 'users',
        createdAt: now,
      });
    }

    if (cancelledOrdersWeek >= 3) {
      notifications.push({
        id: 'cancellation-spike',
        severity: cancelledOrdersWeek >= 8 ? 'critical' : 'warning',
        title: 'Cancellation trend alert',
        message: `${cancelledOrdersWeek} orders were cancelled in the last 7 days.`,
        metric: cancelledOrdersWeek,
        targetTab: 'orders',
        createdAt: now,
      });
    }

    notifications.push({
      id: 'moderation-weekly',
      severity: 'info',
      title: 'Weekly moderation activity',
      message: `${moderationActionsWeek} moderation actions were recorded over the last 7 days.`,
      metric: moderationActionsWeek,
      targetTab: 'activity',
      createdAt: now,
    });

    return sendSuccess(res, {
      message: 'Admin notifications fetched successfully',
      data: notifications,
      extras: {
        count: notifications.length,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const exportFlaggedUsersCsv = async (req, res, next) => {
  try {
    const users = await User.find({ flagged: true })
      .select('_id fullName email role trustScore verificationStatus flagged createdAt updatedAt')
      .sort({ updatedAt: -1 });

    const csv = toCsv(
      ['id', 'fullName', 'email', 'role', 'trustScore', 'verificationStatus', 'flagged', 'createdAt', 'updatedAt'],
      users.map((user) => ({
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        trustScore: user.trustScore,
        verificationStatus: user.verificationStatus,
        flagged: user.flagged,
        createdAt: user.createdAt?.toISOString?.() || user.createdAt,
        updatedAt: user.updatedAt?.toISOString?.() || user.updatedAt,
      }))
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="flagged-users.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    return next(error);
  }
};

const exportReviewReportsCsv = async (req, res, next) => {
  try {
    const reviews = await Review.find({ 'report.isReported': true })
      .populate('reviewerId', '_id fullName email')
      .populate('revieweeId', '_id fullName email')
      .populate('report.reportedBy', '_id fullName email')
      .sort({ 'report.reportedAt': -1, updatedAt: -1 })
      .limit(500);

    const csv = toCsv(
      ['reviewId', 'orderId', 'reviewer', 'reviewee', 'rating', 'comment', 'reportStatus', 'reportReason', 'reportedBy', 'reportedAt', 'resolvedAt'],
      reviews.map((review) => ({
        reviewId: String(review._id),
        orderId: String(review.orderId || ''),
        reviewer: review.reviewerId?.fullName || review.reviewerId?.email || '',
        reviewee: review.revieweeId?.fullName || review.revieweeId?.email || '',
        rating: review.rating,
        comment: review.comment,
        reportStatus: review.report?.status || 'pending',
        reportReason: review.report?.reason || '',
        reportedBy: review.report?.reportedBy?.fullName || review.report?.reportedBy?.email || '',
        reportedAt: review.report?.reportedAt?.toISOString?.() || review.report?.reportedAt || '',
        resolvedAt: review.report?.resolvedAt?.toISOString?.() || review.report?.resolvedAt || '',
      }))
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="review-reports.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    return next(error);
  }
};

const exportModerationActivityCsv = async (req, res, next) => {
  try {
    const events = await AuditEvent.find({
      eventType: {
        $in: [
          'moderation.verification_approved',
          'moderation.verification_rejected',
          'admin.complaint_penalty_applied',
          'admin.account_suspended',
          'admin.listing_removed',
          'review.reported',
          'review.report_resolved',
        ],
      },
    })
      .populate('actorId', '_id fullName email role')
      .sort({ createdAt: -1 })
      .limit(500);

    const csv = toCsv(
      ['eventType', 'entityType', 'entityId', 'actor', 'createdAt', 'reason'],
      events.map((event) => ({
        eventType: event.eventType,
        entityType: event.entityType,
        entityId: String(event.entityId || ''),
        actor: event.actorId?.fullName || event.actorId?.email || '',
        createdAt: event.createdAt?.toISOString?.() || event.createdAt,
        reason: event.payload?.reason || event.payload?.adminNote || '',
      }))
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="moderation-activity.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    return next(error);
  }
};

const applyAdminComplaintPenalty = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!userId) {
      return sendError(res, { statusCode: 400, message: 'userId is required' });
    }

    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return sendError(res, { statusCode: 400, message: 'Complaint reason is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found' });
    }

    const trustUpdate = await updateUserTrustScore(userId, -TRUST_SCORE_RULES.ADMIN_COMPLAINT_PENALTY, {
      actorId: req.user._id,
      reason: 'admin_complaint_penalty',
      context: {
        reason: reason.trim(),
      },
    });
    
    await AuditEvent.create({
      eventType: 'admin.complaint_penalty_applied',
      actorId: req.user._id,
      entityType: 'user',
      entityId: user._id,
      payload: {
        reason: reason.trim(),
        previousTrustScore: trustUpdate?.previousScore,
        newTrustScore: trustUpdate?.trustScore,
        penalty: TRUST_SCORE_RULES.ADMIN_COMPLAINT_PENALTY,
      },
    });

    return sendSuccess(res, {
      message: 'Admin complaint penalty applied successfully',
      data: trustUpdate,
      extras: {
        userId,
        reason: reason.trim(),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const suspendUserAccount = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found' });
    }

    user.flagged = true;
    await user.save();

    await AuditEvent.create({
      eventType: 'admin.account_suspended',
      actorId: req.user._id,
      entityType: 'user',
      entityId: user._id,
      payload: {
        reason: req.body.reason || 'Account suspension by admin',
      },
    });

    return sendSuccess(res, {
      message: 'User account suspended successfully',
      data: User.sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const removeListingByAdmin = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(String(listingId || ''))) {
      return sendError(res, { statusCode: 400, message: 'Invalid listingId' });
    }

    const reason = typeof req.body?.reason === 'string' && req.body.reason.trim()
      ? req.body.reason.trim()
      : 'Policy violation';

    const product = await Product.findById(listingId);
    if (!product) {
      return sendError(res, { statusCode: 404, message: 'Listing not found' });
    }
    
    await Product.findByIdAndDelete(listingId);

    await AuditEvent.create({
      eventType: 'admin.listing_removed',
      actorId: req.user._id,
      entityType: 'listing',
      entityId: product._id,
      payload: {
        reason,
        productTitle: product.title,
        sellerId: product.sellerId,
      },
    });

    return sendSuccess(res, {
      message: 'Listing removed successfully',
      data: {
        listingId: String(product._id),
      },
      extras: {
        listingId,
        reason,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('_id fullName email role trustScore flagged verificationStatus createdAt updatedAt')
      .sort({ createdAt: -1 });

    const userCounts = {
      total: users.length,
      byRole: {},
      byStatus: {},
    };

    users.forEach((user) => {
      const role = user.role || 'student';
      userCounts.byRole[role] = (userCounts.byRole[role] || 0) + 1;
      
      const status = user.flagged ? 'flagged' : (user.verificationStatus || 'unverified');
      userCounts.byStatus[status] = (userCounts.byStatus[status] || 0) + 1;
    });

    return sendSuccess(res, {
      message: 'All users fetched successfully',
      data: users,
      pagination: {
        total: users.length,
        count: users.length,
      },
      extras: {
        userCounts,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
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
  getAllUsers,
};
