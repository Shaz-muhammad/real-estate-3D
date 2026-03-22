# Real Estate Platform (MERN + 3D)

Interactive futuristic real-estate platform:

- **Sellers**: register/login, upload property images + 3D model files (`.glb/.gltf/.usdz`), manage listings.
- **Buyers**: register/login, browse/search/filter properties, view property details with an interactive **3D viewer** (GLB/GLTF), contact sellers.

## Folder structure

```
real-estate-platform/
  backend/
  frontend/
```

## Prerequisites

- Node.js 18+
- **Docker Desktop** (recommended) _or_ MongoDB Atlas / local Mongo install

### Deploy to production (not local)

See **[DEPLOY.md](./DEPLOY.md)** — MongoDB Atlas + host the API (e.g. Render) + host the frontend (e.g. Vercel), with `VITE_API_URL` pointing at your live API.

---

## Quick start (recommended — works when Atlas / port 27017 is blocked)

Use **local MongoDB in Docker** and a **`backend/.env.local`** override (your `backend/.env` can keep Atlas for later).

1. **Start MongoDB**

   ```bash
   docker compose up -d
   ```

2. **Point the backend at local Mongo** — copy the example (or use the file already in the repo if present):

   ```bash
   copy backend\.env.local.example backend\.env.local
   ```

   `backend/.env.local` should contain:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/realestate
   ```

3. **Install & run everything**

   ```bash
   npm install
   npm run install:all
   npm run dev
   ```

   - API: `http://localhost:5000`
   - App: `http://localhost:5173`

The server loads **`backend/.env`** first, then **`backend/.env.local`** (overrides). Atlas stays in `.env` until your network allows it; local dev uses Docker.

### `docker` is not recognized (Windows)

PowerShell shows **`The term 'docker' is not recognized`** → Docker isn’t installed or not on your `PATH`.

**Option A — Install Docker (then use the Quick start above)**

1. Install **[Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)**.
2. Start Docker Desktop and wait until it says it’s running.
3. **Close and reopen** PowerShell (so `PATH` updates).
4. Run: `docker compose version` — if that works, run `docker compose up -d` from the project root.

**Option B — No Docker: install MongoDB on Windows**

1. Download and install **[MongoDB Community Server](https://www.mongodb.com/try/download/community)** (default port **27017**), **or** in PowerShell (if you use winget):

   ```powershell
   winget install MongoDB.Server --accept-package-agreements
   ```

2. Make sure the **MongoDB** Windows service is **Running** (Services → `MongoDB` → Start).

3. Keep **`backend/.env.local`** with:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/realestate
   ```

4. From `backend/`: `npm run dev` (or from repo root: `npm run dev`).

**Option C — MongoDB Atlas only**  
Fix Atlas **Network Access** + outbound **TCP 27017** (see troubleshooting below), then remove or empty **`backend/.env.local`** so **`backend/.env`** Atlas `MONGO_URI` is used.

---

## 1) Backend setup

```bash
cd backend
npm install
```

Create `backend/.env` (or copy from `backend/.env.example`):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_ORIGIN=http://localhost:5173
```

**MongoDB Atlas tip:** If your password contains `@`, `#`, or `?`, you must **URL-encode** it in the URI (e.g. `@` → `%40`). Otherwise the driver will parse the host wrong and connection fails.

**Security:** Never commit `backend/.env` or `frontend/.env` (they are listed in `.gitignore`). If credentials were shared publicly, rotate your MongoDB user password in Atlas.

Run backend:

```bash
npm run dev
```

Backend will run at `http://localhost:5000`.

### `querySrv ECONNREFUSED` (Node) but `nslookup` SRV works?

`mongodb+srv://` forces Node to run a **DNS SRV** query. On some Windows networks that fails in Node even when `nslookup` works.

**Fix: use the standard URI (no `+srv`).**

1. Atlas → your cluster → **Connect** → **Drivers** → **Node.js**.
2. Choose **Connection string** and pick the **`mongodb://`** form if shown (three shard hostnames, `tls=true`, `replicaSet=atlas-…-shard-0`), **not** `mongodb+srv://`.
3. Put that full string in `backend/.env` as **`MONGO_URI`**, **or** set **`MONGO_URI_DIRECT`** (same value) — `server.js` prefers `MONGO_URI_DIRECT` when set.

This project’s sample `.env` may already use shard hosts from your cluster’s SRV answer; if you get a **replica set** error, paste the exact `replicaSet=…` value from Atlas into the URI.

This repo also sets **`dns.setDefaultResultOrder("ipv4first")`** in `server.js` for A/AAAA ordering issues (does not always fix SRV).

### `ReplicaSetNoPrimary` / `servers: Map(0) {}` / selection timeout

The driver **never reached Atlas over the network**. Your app and URI can be correct; **Windows still cannot open TCP to port 27017** on the shard hosts until the network allows it.

**1) Prove it on your PC (Windows)**

From `backend/`:

```bash
npm run check-atlas
```

Or:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-atlas-connection.ps1
```

- If **`TcpTestSucceeded = False`** for all three hosts → **not a code bug**. Fix network / Atlas IP list first.
- If **`True`** but Node still times out, set in `.env`: `MONGO_USE_IPV4=false` and retry (rare IPv4-only quirk).

**2) Atlas**

- **Network Access**: add **your current public IP**, or for dev only **`0.0.0.0/0`**.
- Wait **1–2 minutes** after saving.

**3) Network**

- Turn **VPN** off or try **phone hotspot**.
- School/work Wi‑Fi often blocks **non‑HTTP ports** (27017).

**4) Same URI in MongoDB Compass**

If Compass also cannot connect with the same string, the problem is **environment/network**, not this repo.

**5) Develop offline with local MongoDB**

Install [MongoDB Community](https://www.mongodb.com/try/download/community) locally, then in `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/realestate
```

(No `tls` needed for local default.)

### Uploads

Files are stored under `backend/uploads/` and served at:

- `http://localhost:5000/uploads/<filename>`

Allowed uploads:

- Images: `.jpg .jpeg .png .webp`
- 3D: `.glb .gltf .usdz`

## 2) Frontend setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

Frontend will run at `http://localhost:5173`.

## Accounts / Roles

- Register via the UI and select **Buyer** or **Seller**.
- Separate logins: **Buyer**, **Seller**, **Admin** (`/login/admin`).

### Admin user (first-time)

Admins are **not** created from the public signup form. After MongoDB is connected, set in **`backend/.env`**:

```env
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=your_strong_password
```

Restart the server once. The app will **create** (or **promote**) that user as **`role: admin`**. Then log in at **`/login/admin`**.

Admin can **delete buyers/sellers** (not other admins) and **delete any property**.

## Seller: how to capture real 3D models (photogrammetry)

To boost buyer engagement, capture a property/room/object scan and export a 3D model:

- **Polycam**: `https://poly.cam/`
- **Qlone**: `https://www.qlone.pro/`
- **KIRI Engine**: `https://kiri3d.com/`

Recommended workflow:

1. Scan slowly with consistent lighting; avoid shiny surfaces.
2. Capture more angles than you think you need (high overlap).
3. Export as **GLB** or **GLTF** for best web viewing.
4. Upload the exported `.glb/.gltf` file in **Seller Dashboard → Upload Property**.

Note: `.usdz` is accepted for upload and download, but the built-in web viewer renders **GLB/GLTF** (USDZ rendering requires additional platform-specific tooling).

## Scripts

Backend:

- `npm run dev` starts with nodemon
- `npm start` starts with node

Frontend:

- `npm run dev` Vite dev server
- `npm run build` production build
