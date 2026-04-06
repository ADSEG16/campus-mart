import { apiRequest } from "./http";
import { mapProductToListing } from "./products";

const toWatchlistListing = (product) => {
  const listing = mapProductToListing(product);

  return {
    ...listing,
    addedAt: product?.updatedAt || product?.createdAt || new Date().toISOString(),
  };
};

const mapWatchlistResponse = (response) => {
  const items = response?.data || [];
  return items.map(toWatchlistListing);
};

export const getCurrentUserSettings = async ({ token }) => {
  const response = await apiRequest("/users/settings", {
    method: "GET",
    token,
  });

  return response?.data || {};
};

export const updateCurrentUserSettings = async ({ token, payload }) => {
  const response = await apiRequest("/users/settings", {
    method: "PATCH",
    token,
    body: payload,
  });

  return response?.data || {};
};

export const getWatchlist = async ({ token }) => {
  const response = await apiRequest("/users/watchlist", {
    method: "GET",
    token,
  });

  return mapWatchlistResponse(response);
};

export const addWatchlistItem = async ({ token, productId }) => {
  const response = await apiRequest("/users/watchlist", {
    method: "POST",
    token,
    body: { productId },
  });

  return mapWatchlistResponse(response);
};

export const removeWatchlistItem = async ({ token, productId }) => {
  const response = await apiRequest(`/users/watchlist/${encodeURIComponent(productId)}`, {
    method: "DELETE",
    token,
  });

  return mapWatchlistResponse(response);
};

export const clearWatchlistItems = async ({ token }) => {
  const response = await apiRequest("/users/watchlist", {
    method: "DELETE",
    token,
  });

  return mapWatchlistResponse(response);
};

export const getTrustAnalytics = async ({ token, limit = 20 }) => {
  const response = await apiRequest(`/users/trust-analytics?limit=${encodeURIComponent(limit)}`, {
    method: "GET",
    token,
  });

  return response?.data || { currentTrustScore: 0, timeline: [] };
};

export const deleteCurrentUserAccount = async ({ token, confirmation = "DEACTIVATE" }) => {
  return apiRequest("/users/profile", {
    method: "DELETE",
    token,
    body: { confirmation },
  });
};
