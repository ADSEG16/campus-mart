const Product = require('../models/product.model');
const { uploadManyImages } = require('../services/product.service');
const { sendSuccess, sendError } = require('../utils/response');

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
    const { category, condition, minPrice, maxPrice, sellerId, q } = req.query;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

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
      .populate('sellerId', '_id email')
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
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
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
