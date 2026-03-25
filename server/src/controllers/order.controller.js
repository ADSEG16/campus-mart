const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { monitorUserCancellationBehavior } = require('../services/cancellationMonitor.service');
const {
  applySuccessfulDeliveryTrustScore,
  applyCancellationTrustScore,
} = require('../services/trustScore.service');
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

const createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return sendError(res, { statusCode: 400, message: 'At least one order item is required' });
    }

    const normalizedItems = items.map((item) => ({
      productId: item.productId,
      quantity: Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1,
    }));

    const uniqueProductIds = [...new Set(normalizedItems.map((item) => String(item.productId)))];
    const products = await Product.find({ _id: { $in: uniqueProductIds } });

    if (products.length !== uniqueProductIds.length) {
      return sendError(res, { statusCode: 404, message: 'One or more products were not found' });
    }

    const productMap = new Map(products.map((product) => [String(product._id), product]));
    const sellerIds = new Set(products.map((product) => String(product.sellerId)));

    if (sellerIds.size !== 1) {
      return sendError(res, {
        statusCode: 400,
        message: 'All items in an order must belong to the same seller',
      });
    }

    const sellerId = products[0].sellerId;

    if (String(sellerId) === String(req.user._id)) {
      return sendError(res, {
        statusCode: 400,
        message: 'You cannot create an order for your own product',
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    normalizedItems.forEach(({ productId, quantity }) => {
      const product = productMap.get(String(productId));

      if (!product || product.availabilityStatus !== 'Available') {
        throw Object.assign(new Error(`Product ${productId} is not available`), { statusCode: 400 });
      }

      if (product.stock < quantity) {
        throw Object.assign(new Error(`Insufficient stock for product ${product.title}`), { statusCode: 400 });
      }

      const lineTotal = product.price * quantity;
      totalAmount += lineTotal;

      orderItems.push({
        productId: product._id,
        quantity,
        priceSnapshot: product.price,
      });
    });

    const order = await Order.create({
      buyerId: req.user._id,
      sellerId,
      items: orderItems,
      totalAmount,
      status: ORDER_STATUS.PENDING,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Order created successfully',
      data: order,
      extras: { order },
    });
  } catch (error) {
    return next(error);
  }
};

const listOrders = async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const role = req.query.role;

    let filter;

    if (role === 'buyer') {
      filter = { buyerId: req.user._id };
    } else if (role === 'seller') {
      filter = { sellerId: req.user._id };
    } else {
      filter = { $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }] };
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('buyerId', 'fullName email profileImageUrl')
        .populate('sellerId', 'fullName email profileImageUrl')
        .populate('items.productId', 'title price images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return sendSuccess(res, {
      message: 'Orders fetched successfully',
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      extras: {
        count: orders.length,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getOrderDetail = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('buyerId', 'fullName email profileImageUrl')
      .populate('sellerId', 'fullName email profileImageUrl')
      .populate('items.productId', 'title price images');

    if (!order) {
      return sendError(res, { statusCode: 404, message: 'Order not found' });
    }

    const isBuyer = order.buyerId && String(order.buyerId._id || order.buyerId) === String(req.user._id);
    const isSeller = order.sellerId && String(order.sellerId._id || order.sellerId) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return sendError(res, { statusCode: 403, message: 'Not allowed to view this order' });
    }

    return sendSuccess(res, {
      message: 'Order fetched successfully',
      data: order,
      extras: { order },
    });
  } catch (error) {
    return next(error);
  }
};

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
      order.cancelledBy = req.user._id;
    } else {
      order.cancelledBy = null;
    }

    await order.save();

    let trustScoreUpdate;
    if (normalizedNextStatus === ORDER_STATUS.DELIVERED) {
      trustScoreUpdate = await applySuccessfulDeliveryTrustScore(order);
    }

    let monitoring;
    if (normalizedNextStatus === ORDER_STATUS.CANCELLED) {
      monitoring = await monitorUserCancellationBehavior(req.user._id);
      trustScoreUpdate = await applyCancellationTrustScore(req.user._id);
    }

    return sendSuccess(res, {
      message: 'Order status updated successfully',
      data: order,
      extras: {
        order,
        ...(trustScoreUpdate ? { trustScoreUpdate } : {}),
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
  createOrder,
  listOrders,
  getOrderDetail,
  updateOrderStatus,
  cancelOrder,
};
