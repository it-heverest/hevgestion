// services/api.ts — single shared axios instance for all services
import axios from "axios";
import { API_CONFIG } from "../config/api";
import { authService } from "./auth.service";

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Signal the AuthContext to clear state and redirect cleanly via React Router.
      // We use a custom event so this module stays decoupled from React context.
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(error);
  },
);

export default api;
