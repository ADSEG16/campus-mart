const User = require('../models/user.model');

const TRUST_SCORE_RULES = Object.freeze({
  DEFAULT: 50,
  MIN: 0,
  MAX: 100,
  SUCCESSFUL_DELIVERY_REWARD: 5,
  CANCELLATION_PENALTY: 2,
});

const clampScore = (score) => {
  return Math.max(TRUST_SCORE_RULES.MIN, Math.min(TRUST_SCORE_RULES.MAX, score));
};

const updateUserTrustScore = async (userId, delta) => {
  if (!userId) {
    return null;
  }

  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  const currentScore = Number.isFinite(user.trustScore)
    ? user.trustScore
    : TRUST_SCORE_RULES.DEFAULT;
  const nextScore = clampScore(currentScore + delta);

  user.trustScore = nextScore;

  if (typeof user.save === 'function') {
    await user.save();
  } else {
    await User.findByIdAndUpdate(userId, { trustScore: nextScore });
  }

  return {
    userId: String(userId),
    previousScore: currentScore,
    trustScore: nextScore,
    delta,
  };
};

const applySuccessfulDeliveryTrustScore = async (order) => {
  const [buyer, seller] = await Promise.all([
    updateUserTrustScore(order?.buyerId, TRUST_SCORE_RULES.SUCCESSFUL_DELIVERY_REWARD),
    updateUserTrustScore(order?.sellerId, TRUST_SCORE_RULES.SUCCESSFUL_DELIVERY_REWARD),
  ]);

  return {
    event: 'delivered',
    buyer,
    seller,
  };
};

const applyCancellationTrustScore = async (userId) => {
  const updated = await updateUserTrustScore(userId, -TRUST_SCORE_RULES.CANCELLATION_PENALTY);

  return {
    event: 'cancelled',
    actor: updated,
  };
};

module.exports = {
  TRUST_SCORE_RULES,
  applySuccessfulDeliveryTrustScore,
  applyCancellationTrustScore,
};