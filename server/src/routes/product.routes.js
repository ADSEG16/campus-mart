const express = require('express');
const { requireUser, requireAdmin } = require('../middleware/auth.middleware');
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
router.get('/:productId', getProductById);
router.get('/seller/:sellerId', getProductsBySeller);

// Protected routes (seller/admin only)
router.post('/', requireUser, createProduct);
router.patch('/:productId', requireUser, updateProduct);
router.delete('/:productId', requireUser, deleteProduct);

module.exports = router;
