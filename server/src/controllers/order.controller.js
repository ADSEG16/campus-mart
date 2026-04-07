const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Review = require('../models/review.model');
const Conversation = require('../models/conversation');
const Message = require('../models/message');
const mongoose = require('mongoose');
const { monitorUserCancellationBehavior } = require('../services/cancellationMonitor.service');
const {
  applySuccessfulDeliveryTrustScore,
  applyCancellationTrustScore,
  applyReviewTrustScore,
} = require('../services/trustScore.service');
const AuditEvent = require('../models/auditEvent.model');
const { sendSuccess, sendError } = require('../utils/response');
const {
  ORDER_STATUS,
  ORDER_ALLOWED_TRANSITIONS,
  ORDER_STATUS_VALUES,
} = require('../constants/order.status');

const DEFAULT_SMTP_FROM = 'CampusMart <no-reply@st.ug.edu.gh>';

const parseBooleanEnv = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const createSmtpTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = Number.parseInt(process.env.SMTP_PORT, 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || Number.isNaN(port) || !user || !pass) {
    const error = new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
    error.statusCode = 500;
    throw error;
  }

  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (error) {
    const moduleError = new Error('Nodemailer is not available. Install dependencies and restart the server.');
    moduleError.statusCode = 500;
    throw moduleError;
  }

  const secure = parseBooleanEnv(process.env.SMTP_SECURE, port === 465);
  const rejectUnauthorized = parseBooleanEnv(process.env.SMTP_REJECT_UNAUTHORIZED, true);
  const requireTLS = parseBooleanEnv(process.env.SMTP_REQUIRE_TLS, port === 587);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS,
    auth: {
      user,
      pass,
    },
    ...(rejectUnauthorized ? {} : { tls: { rejectUnauthorized: false } }),
  });
};

const resolveSmtpFrom = () => {
  const configuredFrom = (process.env.SMTP_FROM || '').trim();
  const smtpUser = (process.env.SMTP_USER || '').trim();

  const fallbackSender = smtpUser ? `CampusMart <${smtpUser}>` : DEFAULT_SMTP_FROM;

  if (!configuredFrom) {
    return fallbackSender;
  }

  if (configuredFrom.includes('<') && configuredFrom.includes('>')) {
    return configuredFrom;
  }

  const emailMatch = configuredFrom.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
  if (!emailMatch) {
    return fallbackSender;
  }

  const email = String(emailMatch[0]).trim();
  if ((email.match(/@/g) || []).length !== 1) {
    return fallbackSender;
  }

  const displayName = configuredFrom
    .replace(email, '')
    .replace(/[<>\"]/g, '')
    .replace(/[:;,]+$/g, '')
    .trim();

  return displayName ? `${displayName} <${email}>` : `CampusMart <${email}>`;
};

const buildDeliveryEmail = ({ recipientName, order, roleLabel }) => {
  const meetingPoint = order?.meetupLocation || 'a verified meeting point';
  const orderTitle = order?.items?.[0]?.productId?.title || 'Campus Mart order';
  const statusLabel = String(order?.status || 'Delivered').toUpperCase();
  const safeName = recipientName || 'there';

  return {
    subject: `Your ${orderTitle} order has been marked delivered`,
    text: `Hi ${safeName},

Your ${roleLabel} order for ${orderTitle} has now been marked as delivered.

Meeting point: ${meetingPoint}
Status: ${statusLabel}

You can open the order thread in Campus Mart to review the conversation history.
`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 640px; margin: 0 auto; padding: 24px; }
    .card { background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); }
    .brand { font-size: 24px; font-weight: 700; color: #0f6fff; margin-bottom: 18px; }
    .title { font-size: 22px; font-weight: 700; margin: 0 0 12px; }
    .meta { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .meta p { margin: 6px 0; }
    .footer { font-size: 12px; color: #64748b; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="brand">CampusMart</div>
      <h1 class="title">Delivery completed</h1>
      <p>Hi ${safeName},</p>
      <p>Your ${roleLabel} order for <strong>${orderTitle}</strong> has now been marked as delivered.</p>
      <div class="meta">
        <p><strong>Meeting point:</strong> ${meetingPoint}</p>
        <p><strong>Status:</strong> ${statusLabel}</p>
      </div>
      <p>You can open the order thread in Campus Mart to review the conversation history.</p>
      <div class="footer">This message was sent automatically from CampusMart.</div>
    </div>
  </div>
</body>
</html>`,
  };
};

const sendOrderDeliveryEmails = async (orderId) => {
  const populatedOrder = await Order.findById(orderId)
    .populate('buyerId', 'fullName email')
    .populate('sellerId', 'fullName email')
    .populate('items.productId', 'title')
    .lean();

  if (!populatedOrder) {
    return;
  }

  const transport = createSmtpTransport();
  if (typeof transport.verify === 'function') {
    await transport.verify();
  }

  const from = resolveSmtpFrom();
  const recipients = [
    {
      email: populatedOrder.buyerId?.email,
      name: populatedOrder.buyerId?.fullName,
      roleLabel: 'buyer',
    },
    {
      email: populatedOrder.sellerId?.email,
      name: populatedOrder.sellerId?.fullName,
      roleLabel: 'seller',
    },
  ].filter((recipient) => recipient.email);

  const messages = recipients.map((recipient) => {
    const email = buildDeliveryEmail({
      recipientName: recipient.name,
      order: populatedOrder,
      roleLabel: recipient.roleLabel,
    });

    return {
      from,
      to: recipient.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    };
  });

  await Promise.all(messages.map((message) => transport.sendMail(message)));
};

const LEGACY_STATUS_MAP = Object.freeze({
  pending: ORDER_STATUS.PENDING,
  Pending: ORDER_STATUS.PENDING,
  accepted: ORDER_STATUS.MEETUP_SCHEDULED,
  Accepted: ORDER_STATUS.MEETUP_SCHEDULED,
  completed: ORDER_STATUS.DELIVERED,
  Completed: ORDER_STATUS.DELIVERED,
  cancelled: ORDER_STATUS.CANCELLED,
  Cancelled: ORDER_STATUS.CANCELLED,
  rejected: ORDER_STATUS.CANCELLED,
  Rejected: ORDER_STATUS.CANCELLED,
});

const normalizeStatus = status => LEGACY_STATUS_MAP[status] || status;

const getAllowedNextStatuses = currentStatus => ORDER_ALLOWED_TRANSITIONS[currentStatus] || [];

const canTransition = (currentStatus, nextStatus) => getAllowedNextStatuses(currentStatus).includes(nextStatus);

const SELLER_RESPONSE_WINDOW_HOURS = 48;

const createOrderReview = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { rating, comment } = req.body;

    const parsedRating = Number.parseInt(rating, 10);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return sendError(res, { statusCode: 400, message: 'rating must be an integer between 1 and 5' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, { statusCode: 404, message: 'Order not found' });
    }

    const isBuyer = order.buyerId && order.buyerId.toString() === req.user._id.toString();
    const isSeller = order.sellerId && order.sellerId.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return sendError(res, { statusCode: 403, message: 'Only order participants can submit reviews' });
    }

    if (normalizeStatus(order.status) !== ORDER_STATUS.DELIVERED) {
      return sendError(res, { statusCode: 400, message: 'Reviews can only be submitted after Delivered status' });
    }

    if ((isBuyer && order.buyerReviewed) || (isSeller && order.sellerReviewed)) {
      return sendError(res, { statusCode: 409, message: 'You have already submitted a review for this order' });
    }

    const existingReview = await Review.findOne({
      orderId: order._id,
      reviewerId: req.user._id,
    });

    if (existingReview) {
      return sendError(res, { statusCode: 409, message: 'You have already submitted a review for this order' });
    }

    const review = await Review.create({
      orderId: order._id,
      reviewerId: req.user._id,
      revieweeId: isBuyer ? order.sellerId : order.buyerId,
      reviewerRole: isBuyer ? 'buyer' : 'seller',
      rating: parsedRating,
      comment: typeof comment === 'string' ? comment : '',
    });

    if (isBuyer) {
      order.buyerReviewed = true;
    }

    if (isSeller) {
      order.sellerReviewed = true;
    }

    await order.save();

    const reviewSignal = await applyReviewTrustScore(review);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Review submitted successfully',
      data: review,
      extras: {
        reviewSignal,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const listSellerReviews = async (req, res, next) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return sendError(res, { statusCode: 400, message: 'Invalid sellerId' });
    }

    const [reviews, aggregates] = await Promise.all([
      Review.find({ revieweeId: sellerId, reviewerRole: 'buyer' })
        .populate('reviewerId', '_id fullName email')
        .sort({ createdAt: -1 }),
      Review.aggregate([
        {
          $match: {
            revieweeId: new mongoose.Types.ObjectId(sellerId),
            reviewerRole: 'buyer',
          },
        },
        {
          $group: {
            _id: '$revieweeId',
            averageRating: { $avg: '$rating' },
            ratingCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const summary = aggregates[0]
      ? {
        averageRating: Number(aggregates[0].averageRating.toFixed(2)),
        ratingCount: aggregates[0].ratingCount,
      }
      : {
        averageRating: 0,
        ratingCount: 0,
      };

    const safeReviews = reviews.map((review) => {
      const reviewObject = typeof review.toObject === 'function' ? review.toObject() : review;
      const canExposeReason = reviewObject?.report?.status !== 'pending';

      return {
        ...reviewObject,
        report: {
          isReported: Boolean(reviewObject?.report?.isReported),
          status: reviewObject?.report?.status || null,
          reason: canExposeReason ? (reviewObject?.report?.reason || '') : '',
          reportedAt: reviewObject?.report?.reportedAt || null,
        },
      };
    });

    return sendSuccess(res, {
      message: 'Seller reviews fetched successfully',
      data: safeReviews,
      extras: {
        sellerId,
        summary,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const reportReviewAbuse = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(String(reviewId || ''))) {
      return sendError(res, { statusCode: 400, message: 'Invalid reviewId' });
    }

    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return sendError(res, { statusCode: 400, message: 'Report reason is required' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return sendError(res, { statusCode: 404, message: 'Review not found' });
    }

    if (review.report?.isReported && review.report?.status === 'pending') {
      return sendError(res, { statusCode: 409, message: 'This review has already been reported and is pending moderation' });
    }

    review.report = {
      ...(review.report || {}),
      isReported: true,
      reason: reason.trim(),
      reportedBy: req.user._id,
      reportedAt: new Date(),
      status: 'pending',
      adminNote: '',
      resolvedBy: null,
      resolvedAt: null,
    };

    await review.save();

    await AuditEvent.create({
      eventType: 'review.reported',
      actorId: req.user._id,
      entityType: 'order',
      entityId: review.orderId,
      payload: {
        reviewId: review._id,
        reason: review.report.reason,
        revieweeId: review.revieweeId,
      },
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Review reported successfully',
      data: {
        reviewId: String(review._id),
        reportStatus: review.report.status,
      },
    });
  } catch (error) {
    return next(error);
  }
};

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

    // Reduce stock atomically to prevent race conditions (two simultaneous purchases)
    for (const { productId, quantity } of orderItems) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: productId,
          stock: { $gte: quantity },
          availabilityStatus: 'Available',
        },
        {
          $inc: { stock: -quantity },
        },
        { new: true }
      );

      if (!updated) {
        return sendError(res, {
          statusCode: 409,
          message: 'One or more products are no longer available or have insufficient stock',
        });
      }

      if (updated.stock === 0) {
        await Product.findByIdAndUpdate(productId, {
          availabilityStatus: 'Unavailable',
        });
      }
    }

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

const confirmDelivery = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return sendError(res, { statusCode: 404, message: 'Order not found' });
    }

    const isBuyer = order.buyerId && order.buyerId.toString() === req.user._id.toString();
    const isSeller = order.sellerId && order.sellerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return sendError(res, { statusCode: 403, message: 'Not allowed to confirm delivery for this order' });
    }

    if (normalizeStatus(order.status) !== ORDER_STATUS.MEETUP_SCHEDULED) {
      return sendError(res, {
        statusCode: 400,
        message: 'Delivery can only be confirmed after meetup is scheduled',
      });
    }

    if (isBuyer || isAdmin) {
      order.buyerConfirmed = true;
    }

    if (isSeller || isAdmin) {
      order.sellerConfirmed = true;
    }

    await order.save();
    await AuditEvent.create({
      eventType: 'order.delivery_confirmation_recorded',
      actorId: req.user._id,
      entityType: 'order',
      entityId: order._id,
      payload: {
        status: order.status,
        buyerConfirmed: order.buyerConfirmed,
        sellerConfirmed: order.sellerConfirmed,
      },
    });

    return sendSuccess(res, {
      message: 'Delivery confirmation updated successfully',
      data: order,
      extras: {
        buyerConfirmed: order.buyerConfirmed,
        sellerConfirmed: order.sellerConfirmed,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const {
      nextStatus,
      cancellationReason,
      meetupType,
      meetupLocation,
      meetupScheduledFor,
    } = req.body;

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

    if (
      currentStatus === ORDER_STATUS.PENDING &&
      isSeller &&
      !isAdmin &&
      [ORDER_STATUS.MEETUP_SCHEDULED, ORDER_STATUS.CANCELLED].includes(normalizedNextStatus)
    ) {
      const createdAt = new Date(order.createdAt);
      const deadline = new Date(createdAt.getTime() + SELLER_RESPONSE_WINDOW_HOURS * 60 * 60 * 1000);

      if (Date.now() > deadline.getTime()) {
        return sendError(res, {
          statusCode: 422,
          message: 'Seller acceptance or rejection window has expired for this pending order',
          extras: {
            deadline,
            maxResponseHours: SELLER_RESPONSE_WINDOW_HOURS,
          },
        });
      }
    }

    if (normalizedNextStatus === ORDER_STATUS.MEETUP_SCHEDULED) {
      if (!['verified', 'custom'].includes(meetupType)) {
        return sendError(res, {
          statusCode: 400,
          message: 'meetupType is required and must be either verified or custom when scheduling meetup',
        });
      }

      if (!meetupLocation || typeof meetupLocation !== 'string' || !meetupLocation.trim()) {
        return sendError(res, {
          statusCode: 400,
          message: 'meetupLocation is required when scheduling meetup',
        });
      }

      const scheduledDate = new Date(meetupScheduledFor);
      if (!meetupScheduledFor || Number.isNaN(scheduledDate.getTime())) {
        return sendError(res, {
          statusCode: 400,
          message: 'meetupScheduledFor must be a valid date when scheduling meetup',
        });
      }

      order.meetupType = meetupType;
      order.meetupLocation = meetupLocation.trim();
      order.meetupScheduledFor = scheduledDate;
    }

    if (normalizedNextStatus === ORDER_STATUS.DELIVERED && (!order.buyerConfirmed || !order.sellerConfirmed)) {
      return sendError(res, {
        statusCode: 400,
        message: 'Both buyer and seller must confirm delivery before marking order as Delivered',
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
    await AuditEvent.create({
      eventType: 'order.status_changed',
      actorId: req.user._id,
      entityType: 'order',
      entityId: order._id,
      payload: {
        fromStatus: currentStatus,
        toStatus: normalizedNextStatus,
        cancellationReason: normalizedNextStatus === ORDER_STATUS.CANCELLED ? order.cancellationReason : null,
      },
    });

    let trustScoreUpdate;
    if (normalizedNextStatus === ORDER_STATUS.DELIVERED) {
      trustScoreUpdate = await applySuccessfulDeliveryTrustScore(order);

      try {
        const itemProductIds = (order.items || []).map((item) => item?.productId).filter(Boolean);

        if (itemProductIds.length > 0) {
          await Product.updateMany(
            { _id: { $in: itemProductIds }, stock: { $lte: 0 } },
            { $set: { availabilityStatus: 'Sold' } },
          );
        }
      } catch {
        // Product sold-state sync is best-effort and should not block delivery completion.
      }

      try {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const conversations = await Conversation.find({ orderId: order._id }).select('_id');
        const conversationIds = conversations.map((conversation) => conversation._id);

        if (conversationIds.length > 0) {
          await Conversation.updateMany(
            { _id: { $in: conversationIds } },
            { $set: { expiresAt } },
          );

          await Message.updateMany(
            { conversationId: { $in: conversationIds } },
            { $set: { expiresAt } },
          );
        }

        await sendOrderDeliveryEmails(order._id);
      } catch {
        // Chat cleanup scheduling should not block order delivery completion.
      }
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
  createOrderReview,
  listSellerReviews,
  reportReviewAbuse,
  getOrderDetail,
  confirmDelivery,
  updateOrderStatus,
  cancelOrder,
};
