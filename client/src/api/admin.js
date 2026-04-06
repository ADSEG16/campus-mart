import { apiRequest } from "./http";

export const getFlaggedUsers = async ({ token }) => {
  const response = await apiRequest("/admin/flagged-users", { token });
  return response.data || [];
};

export const getVerificationQueue = async ({ token }) => {
  const response = await apiRequest("/admin/verification-queue", { token });
  return response.data || [];
};

export const suspendUserByAdmin = async ({ token, userId, reason }) => {
  return apiRequest(`/admin/users/${encodeURIComponent(userId)}/suspend`, {
    method: "PATCH",
    token,
    body: { reason },
  });
};

export const approveUserVerificationByAdmin = async ({ token, userId }) => {
  return apiRequest(`/admin/users/${encodeURIComponent(userId)}/verify`, {
    method: "PATCH",
    token,
  });
};

export const rejectUserVerificationByAdmin = async ({ token, userId, reason }) => {
  return apiRequest(`/admin/users/${encodeURIComponent(userId)}/reject`, {
    method: "PATCH",
    token,
    body: { reason },
  });
};

export const applyComplaintPenaltyByAdmin = async ({ token, userId, reason }) => {
  return apiRequest(`/admin/users/${encodeURIComponent(userId)}/complaint`, {
    method: "PATCH",
    token,
    body: { reason },
  });
};

export const removeListingByAdmin = async ({ token, listingId, reason }) => {
  return apiRequest(`/admin/listings/${encodeURIComponent(listingId)}`, {
    method: "DELETE",
    token,
    body: { reason },
  });
};

export const getOrdersByStatusAnalytics = async ({ token }) => {
  const response = await apiRequest("/admin/analytics/orders-by-status", { token });
  return response.data || [];
};

export const getCancellationsTrendAnalytics = async ({ token, days = 7 }) => {
  const response = await apiRequest(`/admin/analytics/cancellations-trend?days=${encodeURIComponent(days)}`, { token });
  return response.data || [];
};

export const getFlaggedUsersTrendAnalytics = async ({ token, days = 7 }) => {
  const response = await apiRequest(`/admin/analytics/flagged-users-trend?days=${encodeURIComponent(days)}`, { token });
  return response.data || [];
};

export const getRecentModerationActivity = async ({ token }) => {
  const response = await apiRequest("/admin/activity", { token });
  return response.data || [];
};

export const getAdminNotifications = async ({ token }) => {
  const response = await apiRequest("/admin/notifications", { token });
  return response.data || [];
};

export const getReportedReviews = async ({ token, status = "pending" }) => {
  const response = await apiRequest(`/admin/review-reports?status=${encodeURIComponent(status)}`, { token });
  return response.data || [];
};

export const resolveReviewReport = async ({ token, reviewId, action, adminNote = "" }) => {
  return apiRequest(`/admin/review-reports/${encodeURIComponent(reviewId)}`, {
    method: "PATCH",
    token,
    body: { action, adminNote },
  });
};
