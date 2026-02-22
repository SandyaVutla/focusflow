// axios.js
import axios from "axios";

import { API_BASE_URL } from "../config";

const apiClient = axios.create({
  baseURL: API_BASE_URL.endsWith("/api") ? API_BASE_URL.replace("/api", "") : API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token ONLY if exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && !config.url.includes("/auth/")) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle 401 ONLY for protected routes
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config.url.includes("/auth/")
    ) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;