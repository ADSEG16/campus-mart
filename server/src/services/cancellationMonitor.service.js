const Order = require('../models/order.model');
const User = require('../models/user.model');
const { ORDER_STATUS } = require('../constants/order.status');

const DEFAULT_CANCELLATION_THRESHOLD = 3;
const WINDOW_HOURS = 24;

const getCancellationThreshold = () => {
  const parsed = Number.parseInt(process.env.CANCELLATION_FLAG_THRESHOLD, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_CANCELLATION_THRESHOLD;
  }
  return parsed;
};

const monitorUserCancellationBehavior = async (userId) => {
  const threshold = getCancellationThreshold();
  const windowStart = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000);

  const cancellationCount = await Order.countDocuments({
    buyerId: userId,
    status: { $in: [ORDER_STATUS.CANCELLED, 'cancelled'] },
    updatedAt: { $gte: windowStart },
  });

  const shouldFlag = cancellationCount > threshold;

  if (shouldFlag) {
    await User.findByIdAndUpdate(userId, { flagged: true });
  }

  return {
    threshold,
    cancellationCount,
    shouldFlag,
  };
};

module.exports = {
  monitorUserCancellationBehavior,
};
