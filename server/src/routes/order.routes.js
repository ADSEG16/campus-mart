const express = require('express');
const { updateOrderStatus, cancelOrder } = require('../controllers/order.controller');
const { requireUser } = require('../middleware/auth.middleware');

const router = express.Router();

router.patch('/:orderId/status', requireUser, updateOrderStatus);
router.patch('/:orderId/cancel', requireUser, cancelOrder);

module.exports = router;
