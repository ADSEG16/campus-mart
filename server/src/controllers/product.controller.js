const Product = require('../models/product.model');
const { uploadManyImages } = require('../services/product.service');

// Create a new product
const createProduct = async (req, res, next) => {
  try {
    const { title, description, category, condition, price, availabilityStatus, stock, meetingSpot } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const uploadedImages = await uploadManyImages(req.files);
    const imageUrls = uploadedImages.map((image) => image.secureUrl);

    const product = new Product({
      title,
      description,
      category,
      condition,
      price,
      sellerId: req.user._id,
      availabilityStatus,
      stock,
      images: imageUrls,
      meetingSpot,
    });

    await product.save();

    return res.status(201).json({
      success: true,
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
    const { category, condition, minPrice, maxPrice, sellerId } = req.query;

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

    const products = await Product.find(filters)
      .populate('sellerId', '_id email')
      .select('-__v');

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
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
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({
      success: true,
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
      return res.status(401).json({ message: 'Authentication required' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the user is the seller
    if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to update this product' });
    }

    const { title, description, category, condition, price, availabilityStatus, stock, meetingSpot } = req.body;

    const uploadedImages = await uploadManyImages(req.files);
    const imageUrls = uploadedImages.map((image) => image.secureUrl);

    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (condition !== undefined) product.condition = condition;
    if (price !== undefined) product.price = price;
    if (availabilityStatus !== undefined) product.availabilityStatus = availabilityStatus;
    if (stock !== undefined) product.stock = stock;
    if (imageUrls.length > 0) product.images = imageUrls;
    if (meetingSpot !== undefined) product.meetingSpot = meetingSpot;

    await product.save();

    return res.status(200).json({
      success: true,
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
      return res.status(401).json({ message: 'Authentication required' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the user is the seller
    if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this product' });
    }

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
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

    const products = await Product.find({ sellerId })
      .populate('sellerId', '_id email')
      .select('-__v');

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
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
