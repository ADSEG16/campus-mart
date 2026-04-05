import { apiRequest } from "./http";

export const signupUser = async (payload) => {
  const response = await apiRequest("/auth/signup", {
    method: "POST",
    body: payload,
  });

  return {
    token: response.token,
    user: response.data,
    raw: response,
  };
};

export const loginUser = async ({ email, password }) => {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  return {
    token: response.token,
    user: response.data,
    raw: response,
  };
};

export const verifyEmailToken = async (token) => {
  return apiRequest("/auth/verify-email", {
    method: "POST",
    body: { token },
  });
};

export const uploadStudentId = async ({ token, file }) => {
  const formData = new FormData();
  formData.append("studentId", file);

  return apiRequest("/auth/upload-student-id", {
    method: "POST",
    token,
    body: formData,
  });
};

export const uploadProfileImage = async ({ token, file }) => {
  const formData = new FormData();
  formData.append("profileImage", file);

  return apiRequest("/auth/upload-profile-image", {
    method: "POST",
    token,
    body: formData,
  });
};

export const completeProfile = async ({ token, bio }) => {
  return apiRequest("/auth/complete-profile", {
    method: "PATCH",
    token,
    body: { bio },
  });
};

export const updateCurrentUserProfile = async ({ token, payload }) => {
  return apiRequest("/users/profile", {
    method: "PATCH",
    token,
    body: payload,
  });
};
