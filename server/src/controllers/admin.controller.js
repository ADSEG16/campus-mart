const User = require('../models/user.model');
const Order = require('../models/order.model');
const AuditEvent = require('../models/auditEvent.model');
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
          status: 'Cancelled',
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

module.exports = {
  getFlaggedUsers,
  approveUserVerification,
  rejectUserVerification,
  getOrdersByStatusAnalytics,
  getCancellationsTrendAnalytics,
  getFlaggedUsersTrendAnalytics,
  exportOrdersByStatusCsv,
};
