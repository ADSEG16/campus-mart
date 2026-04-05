import { apiRequest } from "./http";

const toCurrency = (value) => {
  const amount = Number(value || 0);
  return `GHC ${amount}`;
};

const normalizeCondition = (condition) => {
  const normalized = String(condition || "").toLowerCase();
  return normalized === "new" ? "NEW" : "USED";
};

const toConditionColor = (condition) => {
  if (normalizeCondition(condition) === "NEW") return "blue";
  if (normalizeCondition(condition) === "USED") return "green";
  return "gray";
};

const toListingStatus = (availabilityStatus) => {
  const normalized = String(availabilityStatus || "").toLowerCase();
  if (normalized === "available") return "active";
  if (normalized === "sold") return "sold";
  return "inactive";
};

export const mapProductToListing = (product) => {
  const seller = product?.sellerId || {};
  const sellerName = seller?.fullName || seller?.email || "Campus Seller";

  return {
    id: product._id,
    title: product.title,
    subtitle: product.category,
    description: product.description,
    price: toCurrency(product.price),
    stock: Number(product.stock || 0),
    condition: normalizeCondition(product.condition),
    conditionColor: toConditionColor(product.condition),
    category: product.category,
    image: product.images?.[0]?.url || null,
    user: {
      id: seller?._id || "",
      initials: sellerName
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0] || "")
        .join("")
        .toUpperCase(),
      name: sellerName,
      age: "",
      verified: false,
    },
    status: toListingStatus(product.availabilityStatus),
    statusLabel: product.availabilityStatus || "Available",
    views: product.views || 0,
    inquiries: 0,
    postedDate: product.createdAt || "",
    actions: ["edit", "deactivate"],
    soldTo: null,
    soldDate: null,
    meetingTime: null,
    meetingLocation: null,
    createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
  };
};

export const fetchProducts = async (query = "") => {
  const suffix = query ? `?q=${encodeURIComponent(query)}` : "";
  const response = await apiRequest(`/products${suffix}`);
  return (response.data || []).map(mapProductToListing);
};

export const fetchProductsBySeller = async (sellerId) => {
  const response = await apiRequest(`/products/seller/${encodeURIComponent(sellerId)}`);
  return (response.data || []).map(mapProductToListing);
};

const toSellerView = (seller) => {
  const sellerName = seller?.fullName || seller?.email || "Campus Seller";
  const initials = sellerName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();

  return {
    id: seller?._id || "",
    name: sellerName,
    email: seller?.email || "",
    avatar: initials || "CM",
    major: "Verified Student",
    rating: Number(((seller?.trustScore ?? 0) / 20).toFixed(1)),
    reviews: 0,
    verified: Boolean(seller?.isVerified || seller?.verificationStatus === "verified"),
    emailVerified: Boolean(seller?.emailVerified),
  };
};

export const mapProductToDetail = (product) => {
  const images = Array.isArray(product?.images) && product.images.length > 0
    ? product.images.map((image) => image.url).filter(Boolean)
    : [];

  return {
    id: product?._id,
    title: product?.title || "Untitled Product",
    price: toCurrency(product?.price),
    condition: normalizeCondition(product?.condition),
    category: product?.category || "Other",
    seller: toSellerView(product?.sellerId),
    description: product?.description || "No description provided.",
    highlights: [
      `${product?.category || "General"} item`,
      `Condition: ${normalizeCondition(product?.condition) || "USED"}`,
      `Availability: ${product?.availabilityStatus || "Available"}`,
    ],
    meetingPreferences:
      product?.meetingSpot === "custom"
        ? ["Custom campus meetup location"]
        : ["Verified campus meetup points"],
    images,
  };
};

export const fetchProductById = async (productId) => {
  const response = await apiRequest(`/products/${encodeURIComponent(productId)}`);
  return mapProductToDetail(response.data);
};

const appendProductFields = (formData, payload = {}) => {
  const fields = [
    "title",
    "description",
    "category",
    "condition",
    "price",
    "availabilityStatus",
    "stock",
    "meetingSpot",
  ];

  fields.forEach((field) => {
    if (payload[field] !== undefined && payload[field] !== null && payload[field] !== "") {
      formData.append(field, String(payload[field]));
    }
  });
};

export const createProduct = async ({ token, payload, imageFiles }) => {
  const formData = new FormData();
  appendProductFields(formData, payload);
  (imageFiles || []).forEach((file) => formData.append("images", file));

  return apiRequest("/products", {
    method: "POST",
    token,
    body: formData,
  });
};

export const updateProduct = async ({ token, productId, payload, imageFiles }) => {
  const formData = new FormData();
  appendProductFields(formData, payload);
  (imageFiles || []).forEach((file) => formData.append("images", file));

  return apiRequest(`/products/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    token,
    body: formData,
  });
};

export const fetchProductRawById = async (productId) => {
  const response = await apiRequest(`/products/${encodeURIComponent(productId)}`);
  return response.data;
};
