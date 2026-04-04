const express = require('express');
const { requireUser } = require('../middleware/auth.middleware');
const { productImagesUpload } = require('../config/multer');
const validateOwnership = require('../middleware/ownershipValidation.middleware');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
} = require('../controllers/product.controller');

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/seller/:sellerId', getProductsBySeller);
router.get('/:productId', getProductById);

// Protected routes (seller/admin only)
router.post('/', requireUser, productImagesUpload.array('images', 5), createProduct);
router.patch('/:productId', requireUser, validateOwnership, productImagesUpload.array('images', 5), updateProduct);
router.delete('/:productId', requireUser, validateOwnership, deleteProduct);

module.exports = router;