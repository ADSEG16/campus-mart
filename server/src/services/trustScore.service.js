const User = require('../models/user.model');

const TRUST_SCORE_RULES = Object.freeze({
  DEFAULT: 50,
  MIN: 0,
  MAX: 100,
  SUCCESSFUL_DELIVERY_REWARD: 5,
  CANCELLATION_PENALTY: 2,
  POSITIVE_REVIEW_REWARD: 1,
  NEGATIVE_REVIEW_PENALTY: 1,
  LOW_TRUST_FLAG_THRESHOLD: 20,
});

const clampScore = (score) => {
  return Math.max(TRUST_SCORE_RULES.MIN, Math.min(TRUST_SCORE_RULES.MAX, score));
};

const getLowTrustFlagThreshold = () => {
  const parsed = Number.parseInt(process.env.LOW_TRUST_FLAG_THRESHOLD, 10);
  if (Number.isNaN(parsed)) {
    return TRUST_SCORE_RULES.LOW_TRUST_FLAG_THRESHOLD;
  }

  return clampScore(parsed);
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
  const lowTrustThreshold = getLowTrustFlagThreshold();
  const shouldFlagLowTrust = nextScore <= lowTrustThreshold;

  user.trustScore = nextScore;
  if (shouldFlagLowTrust) {
    user.flagged = true;
  }

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
    lowTrustThreshold,
    flagged: Boolean(user.flagged),
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

const applyReviewTrustScore = async (review) => {
  if (!review || !review.revieweeId) {
    return {
      event: 'review',
      actor: null,
      rating: review?.rating ?? null,
    };
  }

  let delta = 0;
  if (review.rating >= 4) {
    delta = TRUST_SCORE_RULES.POSITIVE_REVIEW_REWARD;
  } else if (review.rating <= 2) {
    delta = -TRUST_SCORE_RULES.NEGATIVE_REVIEW_PENALTY;
  }

  const updated = await updateUserTrustScore(review.revieweeId, delta);

  return {
    event: 'review',
    actor: updated,
    rating: review.rating,
    delta,
  };
};

module.exports = {
  TRUST_SCORE_RULES,
  applySuccessfulDeliveryTrustScore,
  applyCancellationTrustScore,
  applyReviewTrustScore,
};