// frontend/src/services/api.js
import axios from "axios";
import { getToken } from "./auth.js";

// Use environment variable, fallback to localhost for dev
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://real-estate-api-production-bdf6.up.railway.app/api";

const api = axios.create({
  baseURL: API_URL, // IMPORTANT: no extra /api here unless your backend routes need it
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
