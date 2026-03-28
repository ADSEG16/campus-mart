const Product = require('../models/product.model');
const User = require('../models/user.model');
const { sendSuccess, sendError } = require('../utils/response');

const getRecommendations = async (req, res, next) => {
  try {
    const { productId } = req.query;
    const RECOMMENDATION_LIMIT = 10;
    const HIGH_TRUST_SCORE_THRESHOLD = 70;

    let categoryFilter = null;

    // Get category from recently viewed product if productId is provided
    if (productId) {
      const recentProduct = await Product.findById(productId);
      if (recentProduct) {
        categoryFilter = recentProduct.category;
      }
    }

    // Get sellers with high trust scores
    const trustedSellers = await User.find(
      { trustScore: { $gte: HIGH_TRUST_SCORE_THRESHOLD } },
      { _id: 1 }
    );
    const trustedSellerIds = trustedSellers.map((seller) => seller._id);

    // Build base filter — only available products
    const baseFilter = { availabilityStatus: 'Available' };

    // Fetch products for all 3 signals in parallel
    const [categoryProducts, popularProducts, trustedSellerProducts] = await Promise.all([
      // Signal 1: Same category as recently viewed
      categoryFilter
        ? Product.find({ ...baseFilter, category: categoryFilter })
            .limit(RECOMMENDATION_LIMIT)
            .populate('sellerId', 'fullName trustScore profileImageUrl')
        : Promise.resolve([]),

      // Signal 2: Popular listings (sorted by views descending)
      Product.find({ ...baseFilter, views: { $gt: 0 } })
        .sort({ views: -1 })
        .limit(RECOMMENDATION_LIMIT)
        .populate('sellerId', 'fullName trustScore profileImageUrl'),

      // Signal 3: Sellers with high trust scores
      trustedSellerIds.length > 0
        ? Product.find({ ...baseFilter, sellerId: { $in: trustedSellerIds } })
            .limit(RECOMMENDATION_LIMIT)
            .populate('sellerId', 'fullName trustScore profileImageUrl')
        : Promise.resolve([]),
    ]);

    // Merge all results, remove duplicates by product ID
    const seen = new Set();
    const merged = [...categoryProducts, ...popularProducts, ...trustedSellerProducts].filter(
      (product) => {
        const id = String(product._id);
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      }
    );

    // Score each product based on the 3 signals
    const now = Date.now();
    const scored = merged.map((product) => {
      const daysSincePosted = Math.max(
        (now - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24),
        1
      );
      const popularityScore = product.views / daysSincePosted;
      const categoryScore = categoryFilter && product.category === categoryFilter ? 10 : 0;
      const trustScore =
        product.sellerId && product.sellerId.trustScore >= HIGH_TRUST_SCORE_THRESHOLD ? 5 : 0;
      const totalScore = popularityScore + categoryScore + trustScore;

      return { product, totalScore };
    });

    // Sort by total score descending
    scored.sort((a, b) => b.totalScore - a.totalScore);

    const recommendations = scored.slice(0, RECOMMENDATION_LIMIT).map((item) => item.product);

    return sendSuccess(res, {
      message: 'Recommendations fetched successfully',
      data: recommendations,
      extras: {
        count: recommendations.length,
        basedOn: {
          category: categoryFilter || null,
          popularity: true,
          trustedSellers: trustedSellerIds.length,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getRecommendations };