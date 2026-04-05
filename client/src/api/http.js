const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const getStoredAuthToken = () => localStorage.getItem("authToken") || "";

const isFormData = (value) => typeof FormData !== "undefined" && value instanceof FormData;

const buildHeaders = (token, body) => {
  const headers = {};

  if (body !== undefined && !isFormData(body)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const apiRequest = async (path, { method = "GET", body, token } = {}) => {
  const headers = buildHeaders(token, body);
  const requestBody =
    body === undefined ? undefined : isFormData(body) ? body : JSON.stringify(body);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody,
  });

  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

export const getApiBaseUrl = () => API_BASE_URL;
