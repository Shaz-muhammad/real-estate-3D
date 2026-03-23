// frontend/src/services/authApi.js
import api from "./api.js";

/**
 * Register a new user
 * @param {Object} user - { name, email, password, role }
 */
export async function register(user) {
  try {
    const res = await api.post("/auth/register", user);
    return res.data;
  } catch (err) {
    // Throw to handle in Signup component
    throw err.response?.data || { message: "Signup failed" };
  }
}

/**
 * Buyer login
 * @param {Object} credentials - { email, password }
 */
export async function buyerLogin(credentials) {
  try {
    const res = await api.post("/auth/buyer-login", credentials);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Login failed" };
  }
}

/**
 * Seller login
 * @param {Object} credentials - { email, password }
 */
export async function sellerLogin(credentials) {
  try {
    const res = await api.post("/auth/seller-login", credentials);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Login failed" };
  }
}

/**
 * Admin login
 * @param {Object} credentials - { email, password }
 */
export async function adminLogin(credentials) {
  try {
    const res = await api.post("/auth/admin-login", credentials);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Login failed" };
  }
}
