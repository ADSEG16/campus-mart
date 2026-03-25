const User = require('../models/user.model');
const { sendSuccess } = require('../utils/response');

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

module.exports = {
  getFlaggedUsers,
};
