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
    status: order?.status || "Pending",
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

  if (order?.meetupScheduledFor || order?.status === "Meetup Scheduled" || order?.status === "Delivered") {
    progress.push({
      step: "Meeting Scheduled",
      date: formatDate(order?.meetupScheduledFor),
      time: formatTime(order?.meetupScheduledFor),
      note: order?.meetupLocation || undefined,
      completed: true,
    });
  }

  if (order?.status === "Delivered") {
    progress.push({
      step: "Completed",
      date: formatDate(order?.updatedAt),
      time: formatTime(order?.updatedAt),
      completed: true,
    });
  }

  if (order?.status === "Cancelled") {
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
    status: order?.status || "Pending",
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

export const getOrderById = async ({ token, orderId }) => {
  const response = await apiRequest(`/orders/${encodeURIComponent(orderId)}`, { token });
  return response.data;
};

export const submitOrderReview = async ({ token, orderId, rating, comment }) => {
  return apiRequest(`/orders/${encodeURIComponent(orderId)}/reviews`, {
    method: "POST",
    token,
    body: { rating, comment },
  });
};
