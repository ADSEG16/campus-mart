const User = require("../models/user.model");

const findUserByEmail = async (email) => {
  return User.findOne({ email }).select("+password");
};

module.exports = {
  findUserByEmail,
};
