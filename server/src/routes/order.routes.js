const express = require('express');
const {
	createOrder,
	listOrders,
	getOrderDetail,
	updateOrderStatus,
	cancelOrder,
} = require('../controllers/order.controller');
const { requireUser } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', requireUser, createOrder);
router.get('/', requireUser, listOrders);
router.get('/:orderId', requireUser, getOrderDetail);
router.patch('/:orderId/status', requireUser, updateOrderStatus);
router.patch('/:orderId/cancel', requireUser, cancelOrder);

module.exports = router;
