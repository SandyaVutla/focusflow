import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token safely
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔒 HARDENED 401 HANDLER (CRITICAL FIX)
apiClient.interceptors.response.use(
  res => res,
  error => {
    const token = localStorage.getItem("token");

    if (error.response?.status === 401 && token) {
      console.warn("[AUTH] 401 with token → logging out");
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default apiClient;