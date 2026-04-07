import { apiRequest } from "./http";

export const startConversation = async ({ token, recipientId, productId, orderId }) => {
  const response = await apiRequest("/conversations/start", {
    method: "POST",
    token,
    body: { recipientId, productId, orderId },
  });

  return response?.conversation || response?.data || null;
};

export const getConversations = async ({ token }) => {
  const response = await apiRequest("/conversations", { token });
  return response?.conversations || response?.data || [];
};

export const getConversationMessages = async ({ token, conversationId }) => {
  const response = await apiRequest(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
    token,
  });

  return response?.messages || response?.data || [];
};
