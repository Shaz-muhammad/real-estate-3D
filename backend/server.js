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

// Load .env; .env.local only in non-production (Docker/local override — never use on deployed servers)
dotenv.config({ path: path.join(__dirname, ".env") });
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(__dirname, ".env.local"), override: true });
}

// Fixes many Windows setups where SRV lookup works in nslookup but Node gets ECONNREFUSED
dns.setDefaultResultOrder("ipv4first");

function parseOrigins() {
  const raw = process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || "http://localhost:5173";
  const fromEnv = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const defaults = ["http://localhost:5173", "http://127.0.0.1:5173"];
  return [...new Set([...fromEnv, ...defaults])];
}

const ALLOWED_ORIGINS = parseOrigins();

function isLocalMongoUri(uri) {
  if (!uri || typeof uri !== "string") return false;
  const u = uri.replace(/^mongodb\+srv:\/\//i, "mongodb://");
  return /mongodb:\/\/([^/@]*@)?(127\.0\.0\.1|localhost)(:\d+)?\//i.test(u);
}

function corsOriginHeader(req) {
  const origin = req.headers.origin;
  if (!origin) return ALLOWED_ORIGINS[0];
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return ALLOWED_ORIGINS[0];
}

const app = express();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // correct req.protocol / IPs behind Render, Railway, Fly, etc.
}
app.use(express.json());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);

// Allow browser + Three.js loaders to fetch GLB/GLTF from another origin (Vite dev server)
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", corsOriginHeader(req));
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI;

async function start() {
  if (!MONGO_URI) {
    console.error("Missing MONGO_URI (or MONGO_URI_DIRECT) in backend/.env or .env.local");
    process.exit(1);
  }

  if (MONGO_URI.startsWith("mongodb+srv://")) {
    console.warn(
      "[mongo] Using mongodb+srv:// — if you see querySrv ECONNREFUSED, use standard mongodb:// or local Docker (see README)."
    );
  }

  if (isLocalMongoUri(MONGO_URI)) {
    console.log("[mongo] Using local MongoDB URI — good for Docker / offline dev.");
  }

  const connectOpts = {
    serverSelectionTimeoutMS: isLocalMongoUri(MONGO_URI) ? 10000 : 45000,
  };
  // Atlas over IPv4-only networks; skip for localhost so behavior stays predictable
  if (!isLocalMongoUri(MONGO_URI) && process.env.MONGO_USE_IPV4 !== "false") {
    connectOpts.family = 4;
  }

  await mongoose.connect(MONGO_URI, connectOpts);
  console.log("MongoDB connected");

  await ensureAdminUser();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend listening on port ${PORT} (${process.env.NODE_ENV || "development"})`);
  });
}

start().catch((err) => {
  console.error(err);
  const reason = err?.reason;
  const noServers =
    reason?.servers?.size === 0 ||
    (String(reason?.type || "").includes("ReplicaSet") && reason?.servers?.size === 0);
  if (noServers || String(err?.message || "").includes("timed out")) {
    console.error(`
[Mongo] Could not reach the database. Fixes that usually work:
  A) Local dev (recommended if Atlas is blocked):
     1. From repo root:  docker compose up -d
     2. Create backend/.env.local with:
        MONGO_URI=mongodb://127.0.0.1:27017/realestate
     (See backend/.env.local.example — .env.local overrides .env)
     3. Run:  node server.js

  B) Atlas:
     1. Network Access → allow your IP or 0.0.0.0/0
     2. Outbound TCP 27017 allowed (try phone hotspot)
     3. npm run check-atlas  (from backend folder)
`);
  }
  process.exit(1);
});
