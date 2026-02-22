// config.js
// Standardize the API Base URL. 
// In production, Render uses the URL defined in VITE_API_BASE_URL.
// In local development, it falls back to localhost:8081/api.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

// Helper to ensure paths start with /api if they don't already
export const getApiPath = (path) => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return cleanPath.startsWith("/api") ? cleanPath : `/api${cleanPath}`;
};
