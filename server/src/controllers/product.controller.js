const Product = require('../models/product.model');
const Order = require('../models/order.model');
const { uploadManyImages } = require('../services/product.service');
const { ORDER_STATUS } = require('../constants/order.status');
const { sendSuccess, sendError } = require('../utils/response');

const PRODUCT_SORT_OPTIONS = Object.freeze({
  RECENT: 'recent',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  TRUST_DESC: 'trust_desc',
});

const normalizeProductSortOption = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (Object.values(PRODUCT_SORT_OPTIONS).includes(normalized)) {
    return normalized;
  }

  return PRODUCT_SORT_OPTIONS.RECENT;
};

const parseTrustScore = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return Math.min(Math.max(parsed, 0), 100);
};

// Create a new product
const createProduct = async (req, res, next) => {
  try {
    const { title, description, category, condition, price, availabilityStatus, stock, meetingSpot } = req.body;

    if (!req.user) {
      return sendError(res, { statusCode: 401, message: 'Authentication required' });
    }

    if (!Array.isArray(req.files) || req.files.length === 0) {
      return sendError(res, { statusCode: 400, message: 'At least one product image is required' });
    }

    const uploadedImages = await uploadManyImages(req.files);
    const imageObjects = uploadedImages.map((image) => ({
      url: image.secureUrl,
      publicId: image.publicId,
    }));

    const product = new Product({
      title,
      description,
      category,
      condition,
      price,
      sellerId: req.user._id,
      availabilityStatus,
      stock,
      images: imageObjects,
      meetingSpot,
    });

    await product.save();

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

// Get all products (with optional filters)
const getAllProducts = async (req, res, next) => {
  try {
    const {
      category,
      condition,
      minPrice,
      maxPrice,
      sellerId,
      q,
      minTrustScore,
      maxTrustScore,
      sortBy,
    } = req.query;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 100, 1), 100);
    const skip = (page - 1) * limit;
    const normalizedSortBy = normalizeProductSortOption(sortBy);
    const parsedMinTrustScore = parseTrustScore(minTrustScore);
    const parsedMaxTrustScore = parseTrustScore(maxTrustScore);

    if (
      parsedMinTrustScore !== null &&
      parsedMaxTrustScore !== null &&
      parsedMinTrustScore > parsedMaxTrustScore
    ) {
      return sendError(res, {
        statusCode: 400,
        message: 'minTrustScore cannot be greater than maxTrustScore',
      });
    }

    const filters = {};

    if (category) {
      filters.category = category;
    }

    if (condition) {
      filters.condition = condition;
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) {
        filters.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        filters.price.$lte = parseFloat(maxPrice);
      }
    }

    if (sellerId) {
      filters.sellerId = sellerId;
    }

    if (q && q.trim()) {
      filters.$text = { $search: q.trim() };
    }

    const trustScoreFilters = {};
    if (parsedMinTrustScore !== null) {
      trustScoreFilters.$gte = parsedMinTrustScore;
    }

    if (parsedMaxTrustScore !== null) {
      trustScoreFilters.$lte = parsedMaxTrustScore;
    }

    const shouldUseSellerAggregation =
      Object.keys(trustScoreFilters).length > 0 ||
      normalizedSortBy === PRODUCT_SORT_OPTIONS.TRUST_DESC;

    let products = [];
    let total = 0;

    if (shouldUseSellerAggregation) {
      const aggregatePipeline = [
        { $match: filters },
        {
          $lookup: {
            from: 'users',
            localField: 'sellerId',
            foreignField: '_id',
            as: 'seller',
          },
        },
        { $unwind: '$seller' },
      ];

      if (Object.keys(trustScoreFilters).length > 0) {
        aggregatePipeline.push({ $match: { 'seller.trustScore': trustScoreFilters } });
      }

      const sortStage =
        normalizedSortBy === PRODUCT_SORT_OPTIONS.PRICE_ASC
          ? { price: 1, createdAt: -1 }
          : normalizedSortBy === PRODUCT_SORT_OPTIONS.PRICE_DESC
            ? { price: -1, createdAt: -1 }
            : normalizedSortBy === PRODUCT_SORT_OPTIONS.TRUST_DESC
              ? { 'seller.trustScore': -1, createdAt: -1 }
              : { createdAt: -1 };

      aggregatePipeline.push(
        { $sort: sortStage },
        {
          $facet: {
            data: [
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  description: 1,
                  category: 1,
                  condition: 1,
                  meetingSpot: 1,
                  price: 1,
                  availabilityStatus: 1,
                  status: 1,
                  stock: 1,
                  views: 1,
                  images: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  sellerId: {
                    _id: '$seller._id',
                    fullName: '$seller.fullName',
                    email: '$seller.email',
                    trustScore: '$seller.trustScore',
                    isVerified: '$seller.isVerified',
                    verificationStatus: '$seller.verificationStatus',
                    profileImageUrl: '$seller.profileImageUrl',
                  },
                },
              },
            ],
            totals: [{ $count: 'count' }],
          },
        }
      );

      const aggregateResult = await Product.aggregate(aggregatePipeline);
      const firstResult = Array.isArray(aggregateResult) ? aggregateResult[0] : null;

      products = firstResult?.data || [];
      total = firstResult?.totals?.[0]?.count || 0;
    } else {
      const sortStage =
        normalizedSortBy === PRODUCT_SORT_OPTIONS.PRICE_ASC
          ? { price: 1, createdAt: -1 }
          : normalizedSortBy === PRODUCT_SORT_OPTIONS.PRICE_DESC
            ? { price: -1, createdAt: -1 }
            : { createdAt: -1 };

      [products, total] = await Promise.all([
        Product.find(filters)
          .populate('sellerId', '_id fullName email trustScore isVerified verificationStatus profileImageUrl')
          .select('-__v')
          .sort(sortStage)
          .skip(skip)
          .limit(limit),
        Product.countDocuments(filters),
      ]);
    }

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return sendSuccess(res, {
      message: 'Products fetched successfully',
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      extras: {
        count: products.length,
        sortBy: normalizedSortBy,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Get a single product by ID
const getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate('sellerId', '_id fullName email trustScore isVerified emailVerified verificationStatus profileImageUrl')
      .select('-__v');

    if (!product) {
      return sendError(res, { statusCode: 404, message: 'Product not found' });
    }

    return sendSuccess(res, {
      message: 'Product fetched successfully',
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

// Update a product (only by the seller)
const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!req.user) {
      return sendError(res, { statusCode: 401, message: 'Authentication required' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return sendError(res, { statusCode: 404, message: 'Product not found' });
    }

    // Check if the user is the seller
    if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, { statusCode: 403, message: 'You do not have permission to update this product' });
    }

    const { title, description, category, condition, price, availabilityStatus, stock, meetingSpot } = req.body;

    const uploadedImages = await uploadManyImages(req.files);
    const imageObjects = uploadedImages.map((image) => ({
      url: image.secureUrl,
      publicId: image.publicId,
    }));

    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (condition !== undefined) product.condition = condition;
    if (price !== undefined) product.price = price;
    if (availabilityStatus !== undefined) product.availabilityStatus = availabilityStatus;
    if (stock !== undefined) product.stock = stock;
    if (imageObjects.length > 0) product.images = imageObjects;
    if (meetingSpot !== undefined) product.meetingSpot = meetingSpot;

    await product.save();

    return sendSuccess(res, {
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete a product (only by the seller)
const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!req.user) {
      return sendError(res, { statusCode: 401, message: 'Authentication required' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return sendError(res, { statusCode: 404, message: 'Product not found' });
    }

    // Check if the user is the seller
    if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, { statusCode: 403, message: 'You do not have permission to delete this product' });
    }

    const hasActiveOrder = await Order.exists({
      'items.productId': product._id,
      status: {
        $in: [
          ORDER_STATUS.PENDING,
          ORDER_STATUS.MEETUP_SCHEDULED,
          'Pending',
          'Accepted',
          'accepted',
        ],
      },
    });

    if (hasActiveOrder) {
      return sendError(res, {
        statusCode: 409,
        message: 'Cannot delete listing with active pending or meetup scheduled orders',
      });
    }

    await Product.findByIdAndDelete(productId);

    return sendSuccess(res, {
      message: 'Product deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

// Get products by seller
const getProductsBySeller = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 100, 1), 100);
    const skip = (page - 1) * limit;

    const filters = { sellerId };

    const [products, total] = await Promise.all([
      Product.find(filters)
      .populate('sellerId', '_id email')
      .select('-__v')
      .skip(skip)
      .limit(limit),
      Product.countDocuments(filters),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return sendSuccess(res, {
      message: 'Seller products fetched successfully',
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      extras: {
        count: products.length,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
};
