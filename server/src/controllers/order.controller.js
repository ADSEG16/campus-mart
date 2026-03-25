const Order = require('../models/order.model');
const { monitorUserCancellationBehavior } = require('../services/cancellationMonitor.service');
const { sendSuccess, sendError } = require('../utils/response');
const {
  ORDER_STATUS,
  ORDER_ALLOWED_TRANSITIONS,
  ORDER_STATUS_VALUES,
} = require('../constants/order.status');

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
      return sendError(res, { statusCode: 400, message: 'nextStatus is required' });
    }

    const normalizedNextStatus = normalizeStatus(nextStatus);

    if (!ORDER_STATUS_VALUES.includes(normalizedNextStatus)) {
      return sendError(res, {
        statusCode: 400,
        message: 'Invalid nextStatus value',
        extras: { allowedStatuses: ORDER_STATUS_VALUES },
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return sendError(res, { statusCode: 404, message: 'Order not found' });
    }

    const isBuyer = order.buyerId && order.buyerId.toString() === req.user._id.toString();
    const isSeller = order.sellerId && order.sellerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return sendError(res, { statusCode: 403, message: 'Not allowed to update this order' });
    }

    const currentStatus = normalizeStatus(order.status);

    if (currentStatus === normalizedNextStatus) {
      return sendError(res, { statusCode: 400, message: `Order is already ${normalizedNextStatus}` });
    }

    if (!canTransition(currentStatus, normalizedNextStatus)) {
      return sendError(res, {
        statusCode: 400,
        message: `Invalid status transition: ${currentStatus} -> ${normalizedNextStatus}`,
        extras: { allowedTransitions: getAllowedNextStatuses(currentStatus) },
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

    return sendSuccess(res, {
      message: 'Order status updated successfully',
      data: order,
      extras: {
        order,
        ...(monitoring ? { monitoring } : {}),
      },
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
