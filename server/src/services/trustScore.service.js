const User = require('../models/user.model');
const AuditEvent = require('../models/auditEvent.model');

const TRUST_SCORE_RULES = Object.freeze({
  DEFAULT: 50,
  MIN: 0,
  MAX: 100,
  SUCCESSFUL_DELIVERY_REWARD: 5,
  CANCELLATION_PENALTY: 5,
  ADMIN_COMPLAINT_PENALTY: 10,
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

const updateUserTrustScore = async (userId, delta, options = {}) => {
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

  if (delta !== 0) {
    try {
      await AuditEvent.create({
        eventType: 'trust.score_changed',
        actorId: options.actorId || user._id,
        entityType: 'user',
        entityId: user._id,
        payload: {
          reason: options.reason || 'trust_score_adjustment',
          previousScore: currentScore,
          trustScore: nextScore,
          delta,
          context: options.context || {},
        },
      });
    } catch (error) {
      // Trust updates should not fail if analytics logging fails.
    }
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
    updateUserTrustScore(order?.buyerId, TRUST_SCORE_RULES.SUCCESSFUL_DELIVERY_REWARD, {
      actorId: order?.sellerId || order?.buyerId,
      reason: 'order_delivered',
      context: {
        orderId: order?._id,
        role: 'buyer',
      },
    }),
    updateUserTrustScore(order?.sellerId, TRUST_SCORE_RULES.SUCCESSFUL_DELIVERY_REWARD, {
      actorId: order?.buyerId || order?.sellerId,
      reason: 'order_delivered',
      context: {
        orderId: order?._id,
        role: 'seller',
      },
    }),
  ]);

  return {
    event: 'delivered',
    buyer,
    seller,
  };
};

const applyCancellationTrustScore = async (userId, options = {}) => {
  const updated = await updateUserTrustScore(userId, -TRUST_SCORE_RULES.CANCELLATION_PENALTY, {
    actorId: options.actorId || userId,
    reason: options.reason || 'order_cancelled',
    context: options.context || {},
  });

  return {
    event: 'cancelled',
    actor: updated,
  };
};

const applyReviewTrustScore = async (review, options = {}) => {
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

  const updated = await updateUserTrustScore(review.revieweeId, delta, {
    actorId: options.actorId || review.reviewerId || review.revieweeId,
    reason: delta > 0 ? 'positive_review' : delta < 0 ? 'negative_review' : 'neutral_review',
    context: {
      orderId: options.orderId || review.orderId,
      rating: review.rating,
    },
  });

  return {
    event: 'review',
    actor: updated,
    rating: review.rating,
    delta,
  };
};

module.exports = {
  TRUST_SCORE_RULES,
  updateUserTrustScore,
  applySuccessfulDeliveryTrustScore,
  applyCancellationTrustScore,
  applyReviewTrustScore,
};