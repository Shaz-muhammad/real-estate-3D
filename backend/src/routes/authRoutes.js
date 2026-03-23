// backend/src/routes/authRoutes.js
import { Router } from "express";
import {
  register,
  sellerLogin,
  buyerLogin,
  adminLogin,
} from "../controllers/authController.js";

const router = Router();

// Middleware to log request bodies for debugging
router.use((req, res, next) => {
  console.log(`[Auth Route] ${req.method} ${req.path} - Body:`, req.body);
  next();
});

// Auth endpoints
// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    await register(req, res);
  } catch (err) {
    console.error("[Register Error]", err.message);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Signup failed" });
  }
});

// POST /api/auth/seller-login
router.post("/seller-login", async (req, res, next) => {
  try {
    await sellerLogin(req, res);
  } catch (err) {
    console.error("[Seller Login Error]", err.message);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Login failed" });
  }
});

// POST /api/auth/buyer-login
router.post("/buyer-login", async (req, res, next) => {
  try {
    await buyerLogin(req, res);
  } catch (err) {
    console.error("[Buyer Login Error]", err.message);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Login failed" });
  }
});

// POST /api/auth/admin-login
router.post("/admin-login", async (req, res, next) => {
  try {
    await adminLogin(req, res);
  } catch (err) {
    console.error("[Admin Login Error]", err.message);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Login failed" });
  }
});

export default router;
