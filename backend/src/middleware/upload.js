import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]/gi, "_");
    cb(null, `${Date.now()}_${safeBase}${ext}`);
  },
});

const allowedImageExts = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const allowedModelExts = new Set([".glb", ".gltf", ".usdz"]);

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const field = file.fieldname;

  if (field === "images") {
    if (!allowedImageExts.has(ext)) return cb(new Error("Only image files are allowed"));
    return cb(null, true);
  }

  if (field === "model3d") {
    if (!allowedModelExts.has(ext)) return cb(new Error("Only .glb/.gltf/.usdz files are allowed"));
    return cb(null, true);
  }

  return cb(new Error("Unexpected upload field"));
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024
  },
});

export const propertyUpload = upload.fields([
  { name: "images", maxCount: 12 },
  { name: "model3d", maxCount: 1 },
]);

/** Wraps multer so validation/file errors return JSON instead of hanging */
export function propertyUploadMiddleware(req, res, next) {
  propertyUpload(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large (max 50MB per file)" });
    }
    return res.status(400).json({ message: err.message || "Upload failed" });
  });
}

