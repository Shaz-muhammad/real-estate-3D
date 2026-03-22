import { Router } from "express";
import { register, sellerLogin, buyerLogin, adminLogin } from "../controllers/authController.js";

const router = Router();

// Auth: /api/auth/seller-login, /api/auth/buyer-login, /api/auth/register, /api/auth/admin-login
router.post("/register", register);
router.post("/seller-login", sellerLogin);
router.post("/buyer-login", buyerLogin);
router.post("/admin-login", adminLogin);

export default router;

