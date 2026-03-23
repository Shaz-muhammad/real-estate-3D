import axios from "axios";
import { getToken } from "./auth.js"; // make sure you have a getToken function

// Use VITE_API_URL from .env, fallback to localhost for dev
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to every request if available
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
