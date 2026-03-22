import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  listUsers,
  deleteUser,
  listAllProperties,
  adminDeleteProperty,
} from "../controllers/adminController.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", listUsers);
router.delete("/users/:id", deleteUser);
router.get("/properties", listAllProperties);
router.delete("/properties/:id", adminDeleteProperty);

export default router;
