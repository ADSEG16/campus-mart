import { apiRequest } from "./http";
import { mapProductToListing } from "./products";

export const fetchRecommendations = async ({ token, productId } = {}) => {
  const query = productId ? `?productId=${encodeURIComponent(productId)}` : "";
  const response = await apiRequest(`/recommendations${query}`, { token });
  return (response.data || []).map(mapProductToListing);
};
