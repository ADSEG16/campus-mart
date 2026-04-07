import { apiRequest } from "./http";

const formatMoney = (amount) => `GHC ${Number(amount || 0).toFixed(2)}`;

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const normalizeOrderStatus = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "meetup_scheduled") return "Meetup Scheduled";
  if (normalized === "pending") return "Pending";
  if (normalized === "delivered") return "Delivered";
  if (normalized === "cancelled") return "Cancelled";
  return status || "Pending";
};

export const mapOrderToSummary = (order, currentUserId) => {
  const isSale = String(order?.sellerId?._id || order?.sellerId) === String(currentUserId || "");
  const counterparty = isSale ? order?.buyerId : order?.sellerId;
  const firstItem = order?.items?.[0]?.productId;

  return {
    id: order?._id,
    title: firstItem?.title || "Campus Mart Order",
    date: formatDate(order?.createdAt),
    seller: counterparty?.fullName || counterparty?.email || "Campus User",
    verified: Boolean(counterparty?.emailVerified),
    status: normalizeOrderStatus(order?.status),
    amount: formatMoney(order?.totalAmount),
    cancelled: String(order?.status || "").toLowerCase() === "cancelled",
    type: isSale ? "sale" : "purchase",
    image: firstItem?.images?.[0]?.url || null,
  };
};

const buildProgressFromOrder = (order) => {
  const progress = [
    {
      step: "Order Created",
      date: formatDate(order?.createdAt),
      time: formatTime(order?.createdAt),
      completed: true,
    },
  ];

  const normalizedStatus = String(order?.status || "").toLowerCase();

  if (order?.meetupScheduledFor || normalizedStatus === "meetup_scheduled" || normalizedStatus === "delivered") {
    progress.push({
      step: "Meeting Scheduled",
      date: formatDate(order?.meetupScheduledFor),
      time: formatTime(order?.meetupScheduledFor),
      note: order?.meetupLocation || undefined,
      completed: true,
    });
  }

  if (normalizedStatus === "delivered") {
    progress.push({
      step: "Completed",
      date: formatDate(order?.updatedAt),
      time: formatTime(order?.updatedAt),
      completed: true,
    });
  }

  if (normalizedStatus === "cancelled") {
    progress.push({
      step: "Cancelled",
      date: formatDate(order?.updatedAt),
      time: formatTime(order?.updatedAt),
      note: order?.cancellationReason || "Order was cancelled",
      completed: false,
    });
  }

  return progress;
};

export const mapOrderToDetails = (order, currentUserId) => {
  const isSale = String(order?.sellerId?._id || order?.sellerId) === String(currentUserId || "");
  const counterparty = isSale ? order?.buyerId : order?.sellerId;
  const firstItem = order?.items?.[0]?.productId;

  return {
    id: order?._id,
    title: firstItem?.title || "Campus Mart Order",
    date: formatDate(order?.createdAt),
    time: formatTime(order?.createdAt),
    paymentMethod: "Cash on Delivery (COD)",
    seller: counterparty?.fullName || counterparty?.email || "Campus User",
    sellerVerified: Boolean(counterparty?.emailVerified),
    price: formatMoney(order?.totalAmount),
    status: normalizeOrderStatus(order?.status),
    cancelled: String(order?.status || "").toLowerCase() === "cancelled",
    image: firstItem?.images?.[0]?.url || null,
    progress: buildProgressFromOrder(order),
    meetingPoint: order?.meetupLocation || "To be scheduled",
    raw: order,
  };
};

export const listOrders = async ({ token, role } = {}) => {
  const suffix = role ? `?role=${encodeURIComponent(role)}` : "";
  const response = await apiRequest(`/orders${suffix}`, { token });
  return response.data || [];
};

export const createOrder = async ({ token, items }) => {
  const response = await apiRequest("/orders", {
    method: "POST",
    token,
    body: { items },
  });

  return response.data;
};

export const getOrderById = async ({ token, orderId }) => {
  const response = await apiRequest(`/orders/${encodeURIComponent(orderId)}`, { token });
  return response.data;
};

export const updateOrderStatus = async ({ token, orderId, payload }) => {
  const response = await apiRequest(`/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    token,
    body: payload,
  });

  return response.data;
};

export const confirmOrderDelivery = async ({ token, orderId }) => {
  const response = await apiRequest(`/orders/${encodeURIComponent(orderId)}/confirm-delivery`, {
    method: "PATCH",
    token,
  });

  return {
    order: response?.data || null,
    buyerConfirmed: Boolean(response?.extras?.buyerConfirmed),
    sellerConfirmed: Boolean(response?.extras?.sellerConfirmed),
  };
};

export const submitOrderReview = async ({ token, orderId, rating, comment }) => {
  return apiRequest(`/orders/${encodeURIComponent(orderId)}/reviews`, {
    method: "POST",
    token,
    body: { rating, comment },
  });
};

export const listSellerReviews = async ({ sellerId }) => {
  const response = await apiRequest(`/orders/seller/${encodeURIComponent(sellerId)}/reviews`, {
    method: "GET",
  });

  return {
    reviews: response?.data || [],
    summary: response?.summary || response?.extras?.summary || { averageRating: 0, ratingCount: 0 },
  };
};

export const reportReviewAbuse = async ({ token, reviewId, reason }) => {
  return apiRequest(`/orders/reviews/${encodeURIComponent(reviewId)}/report`, {
    method: "POST",
    token,
    body: { reason },
  });
};
