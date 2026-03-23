const express = require('express');
const { requireUser } = require('../middleware/auth.middleware');
const { productImagesUpload } = require('../config/multer');
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
router.patch('/:productId', requireUser, productImagesUpload.array('images', 5), updateProduct);
router.delete('/:productId', requireUser, deleteProduct);

module.exports = router;
