import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { propertyUploadMiddleware } from "../middleware/upload.js";
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  getSellerStats,
  getMyProperties,
  updateProperty,
  patchPropertyStatus,
  deleteProperty,
  likeProperty,
  unlikeProperty,
  getLikedIds,
  getLikedProperties,
} from "../controllers/propertyController.js";

const router = Router();

router.post("/create", requireAuth, requireRole("seller"), propertyUploadMiddleware, createProperty);
router.get("/get-all", getAllProperties);

router.get("/seller/stats/me", requireAuth, requireRole("seller"), getSellerStats);
router.get("/seller/mine", requireAuth, requireRole("seller"), getMyProperties);

router.get("/buyer/liked-ids", requireAuth, requireRole("buyer"), getLikedIds);
router.get("/buyer/liked", requireAuth, requireRole("buyer"), getLikedProperties);

router.post("/:id/like", requireAuth, requireRole("buyer"), likeProperty);
router.delete("/:id/like", requireAuth, requireRole("buyer"), unlikeProperty);

router.patch("/:id/status", requireAuth, patchPropertyStatus);
router.patch("/:id", requireAuth, propertyUploadMiddleware, updateProperty);
router.delete("/:id", requireAuth, deleteProperty);

router.get("/:id", getPropertyById);

export default router;
