const User = require('../models/user.model');
const { sendSuccess, sendError } = require('../utils/response');

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

    return sendSuccess(res, {
      message: 'User verification rejected successfully',
      data: User.sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getFlaggedUsers,
  approveUserVerification,
  rejectUserVerification,
};
