import { listOrders } from "./orders";

export const MESSAGE_NOTIFICATION_STORAGE_KEY = "campusmart.messageNotifications.v1";

const readStoredMessageNotifications = () => {
  try {
    const raw = localStorage.getItem(MESSAGE_NOTIFICATION_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const relativeFromDate = (value) => {
  const date = new Date(value || Date.now());
  const diffMs = Date.now() - date.getTime();
  const mins = Math.max(Math.floor(diffMs / 60000), 1);

  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const fetchNotificationFeed = async ({ token, currentUserId }) => {
  const rawOrders = await listOrders({ token });
  const orders = Array.isArray(rawOrders) ? rawOrders : [];
  const messageNotifications = readStoredMessageNotifications().map((item, index) => {
    const createdAt = item?.createdAt || new Date().toISOString();
    return {
      id: item?.id || `msg-notification-${index}`,
      type: "message",
      title: item?.title || "NEW MESSAGE",
      content: item?.content || "You have a new message.",
      route: item?.route || "/messages",
      time: relativeFromDate(createdAt),
      createdAt,
    };
  });

  const orderNotifications = orders.map((order) => {
    const isSeller = String(order?.sellerId?._id || order?.sellerId) === String(currentUserId || "");
    const actor = isSeller ? order?.buyerId : order?.sellerId;
    const actorName = actor?.fullName || actor?.email || "Campus User";
    const itemTitle = order?.items?.[0]?.productId?.title || "Campus Mart Item";
    const status = String(order?.status || "pending").toLowerCase();

    let type = "system";
    let title = "ORDER UPDATE";
    let content = `${actorName} updated ${itemTitle} to ${status}.`;

    if (status === "pending") {
      type = "message";
      title = "NEW ORDER INTEREST";
      content = `${actorName} is interested in ${itemTitle}.`;
    }

    if (status === "meetup_scheduled") {
      type = "reminder";
      title = "MEETUP REMINDER";
      content = `Meetup set for ${itemTitle} at ${order?.meetupLocation || "a campus location"}.`;
    }

    if (status === "delivered") {
      type = "success";
      title = "ORDER COMPLETED";
      content = `${itemTitle} has been marked delivered.`;
    }

    if (status === "cancelled") {
      type = "warning";
      title = "ORDER CANCELLED";
      content = `${itemTitle} was cancelled${order?.cancellationReason ? `: ${order.cancellationReason}` : "."}`;
    }

    return {
      id: order?._id,
      type,
      title,
      content,
      route: `/messages?order=${encodeURIComponent(order?._id || "")}`,
      time: relativeFromDate(order?.updatedAt || order?.createdAt),
      createdAt: order?.updatedAt || order?.createdAt,
    };
  });

  return [...messageNotifications, ...orderNotifications]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 20);
};
