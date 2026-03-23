// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./src/routes/authRoutes.js";
import propertyRoutes from "./src/routes/propertyRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import { ensureAdminUser } from "./src/utils/ensureAdmin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(__dirname, ".env.local"), override: true });
}

// Fix Node.js DNS IPv6 issues
dns.setDefaultResultOrder("ipv4first");

// CORS Origins
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://real-estate-3-d.vercel.app", // <-- your Vercel frontend URL
];

// CORS helper
function corsOriginHeader(req) {
  const origin = req.headers.origin;
  if (!origin) return ALLOWED_ORIGINS[0];
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return ALLOWED_ORIGINS[0];
}

// Express app
const app = express();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.use(express.json());

// Log every incoming request (for debugging signup/login)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS middleware
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed"), false);
    },
    credentials: true,
  }),
);

// Static uploads for Three.js / GLB files
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", corsOriginHeader(req));
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads")),
);

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/admin", adminRoutes);

// PORT & Mongo
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Missing MONGO_URI (or MONGO_URI_DIRECT) in .env");
  process.exit(1);
}

console.log("Using MongoDB URI:", MONGO_URI);

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 45000,
    family: 4,
  })
  .then(() => {
    console.log("MongoDB connected");
    return ensureAdminUser();
  })
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Backend listening on port ${PORT} (${process.env.NODE_ENV || "development"})`,
      );
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
