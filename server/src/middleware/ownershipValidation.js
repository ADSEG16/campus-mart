const Product = require('../models/product.model');

/**
 * Middleware: Validates that the authenticated user (from JWT)
 * is the seller/owner of the requested product.
 *
 * Expects:
 *  - req.user.id  → set by your existing auth/JWT middleware
 *  - req.params.productId OR req.params.id → the product being accessed
 */
const validateOwnership = async (req, res, next) => {
  try {
    const productId = req.params.productId || req.params.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.',
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Compare JWT user ID with sellerId stored on the product
    const jwtUserId = req.user._id.toString();
    const sellerId = product.sellerId.toString(); // ✅ matches your schema field name

    if (jwtUserId !== sellerId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this product.',
      });
    }

    // Attach product to request so controllers don't need to fetch it again
    req.product = product;
    next();
  } catch (error) {
    console.error('Ownership validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during ownership validation.',
    });
  }
};

module.exports = validateOwnership;