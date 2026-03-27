import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:8081/api",
});

// ── Request interceptor — attach JWT ─────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — handle 401, attempt refresh once ──────────────────

let isRefreshing = false;
// Queue of { resolve, reject } callbacks waiting on the refresh
let refreshQueue = [];

const processQueue = (error, newToken = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(newToken);
    }
  });
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only attempt refresh on 401, and not on auth endpoints themselves,
    // and only if we haven't already retried this request.
    const isAuthEndpoint =
      original.url?.includes("/auth/authenticate") ||
      original.url?.includes("/auth/register") ||
      original.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !original._retried
    ) {
      // Mark so we don't retry infinitely
      original._retried = true;

      if (isRefreshing) {
        // Another request already triggered a refresh — wait for it
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const currentToken = localStorage.getItem("token");
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8081/api"}/auth/refresh`,
          null,
          { headers: { Authorization: `Bearer ${currentToken}` } }
        );

        const newToken = response.data.token;
        localStorage.setItem("token", newToken);

        // Retry all queued requests with the new token
        processQueue(null, newToken);

        // Retry the original request
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        // Refresh failed — token is truly expired or invalid
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


// ── Auth & API helpers ────────────────────────────────────────────────────────

export const register = (userData) => api.post("/auth/register", userData);
export const login = (credentials) => api.post("/auth/authenticate", credentials);

export const getAdById = (id) => api.get(`/ads/${id}`);
export const updateAd = (id, data) => api.put(`/ads/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
export const getMyAds = (params) => api.get('/ads/my', { params });
export const getUserProfile = () => api.get('/users/me');

export default api;
