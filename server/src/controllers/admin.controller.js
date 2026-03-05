const User = require('../models/user.model');

const getFlaggedUsers = async (req, res, next) => {
  try {
    const users = await User.find({ flagged: true })
      .select('_id email role flagged createdAt updatedAt')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getFlaggedUsers,
};
