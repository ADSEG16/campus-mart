const Order = require('../models/order.model');
const { monitorUserCancellationBehavior } = require('../services/cancellationMonitor.service');
const {
  ORDER_STATUS,
  ORDER_ALLOWED_TRANSITIONS,
  ORDER_STATUS_VALUES,
} = require('../constants/orderStatus');

const LEGACY_STATUS_MAP = Object.freeze({
  pending: ORDER_STATUS.PENDING,
  accepted: ORDER_STATUS.MEETUP_SCHEDULED,
  completed: ORDER_STATUS.DELIVERED,
  cancelled: ORDER_STATUS.CANCELLED,
  rejected: ORDER_STATUS.CANCELLED,
});

const normalizeStatus = status => LEGACY_STATUS_MAP[status] || status;

const getAllowedNextStatuses = currentStatus => ORDER_ALLOWED_TRANSITIONS[currentStatus] || [];

const canTransition = (currentStatus, nextStatus) => getAllowedNextStatuses(currentStatus).includes(nextStatus);

const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { nextStatus, cancellationReason } = req.body;

    if (!nextStatus) {
      return res.status(400).json({ message: 'nextStatus is required' });
    }

    const normalizedNextStatus = normalizeStatus(nextStatus);

    if (!ORDER_STATUS_VALUES.includes(normalizedNextStatus)) {
      return res.status(400).json({
        message: 'Invalid nextStatus value',
        allowedStatuses: ORDER_STATUS_VALUES,
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isBuyer = order.buyerId && order.buyerId.toString() === req.user._id.toString();
    const isSeller = order.sellerId && order.sellerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ message: 'Not allowed to update this order' });
    }

    const currentStatus = normalizeStatus(order.status);

    if (currentStatus === normalizedNextStatus) {
      return res.status(400).json({ message: `Order is already ${normalizedNextStatus}` });
    }

    if (!canTransition(currentStatus, normalizedNextStatus)) {
      return res.status(400).json({
        message: `Invalid status transition: ${currentStatus} -> ${normalizedNextStatus}`,
        allowedTransitions: getAllowedNextStatuses(currentStatus),
      });
    }

    order.status = normalizedNextStatus;

    if (normalizedNextStatus === ORDER_STATUS.CANCELLED) {
      order.cancellationReason = cancellationReason || order.cancellationReason;
    }

    await order.save();

    let monitoring;
    if (normalizedNextStatus === ORDER_STATUS.CANCELLED) {
      monitoring = await monitorUserCancellationBehavior(order.buyerId);
    }

    return res.status(200).json({
      message: 'Order status updated successfully',
      order,
      ...(monitoring ? { monitoring } : {}),
    });
  } catch (error) {
    return next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  req.body.nextStatus = ORDER_STATUS.CANCELLED;
  return updateOrderStatus(req, res, next);
};

module.exports = {
  updateOrderStatus,
  cancelOrder,
};
