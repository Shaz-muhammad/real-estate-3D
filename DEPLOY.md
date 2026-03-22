# Deploy the Real Estate Platform (production)

Local dev uses **Docker / local Mongo** or **`.env.local`**. **Production** should use:

| Layer | Recommended |
|--------|-------------|
| Database | **MongoDB Atlas** (free tier is fine to start) |
| API (Express) | **Render**, **Railway**, **Fly.io**, or any Node host |
| Frontend (Vite/React) | **Vercel** or **Netlify** |

Your deployed site is **not** “local” — it uses **public URLs** and **Atlas** in the cloud.

---

## 1) MongoDB Atlas (production)

1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Database Access** → create a user (username + password).
3. **Network Access** → **Add IP Address** → **`0.0.0.0/0`** (allow from anywhere) *for a public API*, or lock down later.
4. **Connect** → **Drivers** → copy the connection string.
   - Prefer **`mongodb+srv://...`** on the server (usually works from cloud hosts).
   - If the host only connects with the **standard `mongodb://` + 3 hosts** string, use that instead (same as in README troubleshooting).

Set:

- `MONGO_URI` = that string (URL-encode special characters in the password, e.g. `@` → `%40`).

---

## 2) Deploy the backend (API)

### Environment variables (required)

| Variable | Example | Notes |
|----------|---------|--------|
| `NODE_ENV` | `production` | Set automatically on many hosts |
| `PORT` | (set by host) | Render/Railway inject `PORT` — do **not** hardcode |
| `MONGO_URI` | `mongodb+srv://...` | Atlas connection string |
| `JWT_SECRET` | long random string | e.g. `openssl rand -hex 32` |
| `CLIENT_ORIGIN` or `CLIENT_ORIGINS` | `https://your-app.vercel.app` | Your **frontend** URL(s), comma-separated if multiple |

**Important:**

- In **production**, the server **does not load `backend/.env.local`** — only host env vars / `backend/.env` if you upload it (prefer dashboard env vars).
- **`CLIENT_ORIGINS`** must include the exact browser origin (scheme + host, no trailing slash), e.g. `https://myapp.vercel.app`.

### File uploads (images / 3D)

On many free PaaS tiers, the filesystem is **ephemeral**: files under `uploads/` can **disappear** after a restart or new deploy.

**For a serious production app**, move uploads to **S3**, **Cloudinary**, **R2**, or **GridFS**.  
For a **demo**, you can still deploy; just expect uploads to be **lost** on redeploy unless the host gives a **persistent disk** (often paid).

### Option A — Render

1. [render.com](https://render.com) → **New** → **Web Service**.
2. Connect your Git repo.
3. **Root directory**: `backend`
4. **Build command**: `npm install`
5. **Start command**: `npm start`
6. Add env vars above.
7. Deploy → note the URL, e.g. `https://real-estate-api.onrender.com`

Your API base for the frontend will be:  
`https://real-estate-api.onrender.com/api`  
(Express mounts routes under `/api`.)

### Option B — Railway / Fly.io

Same idea: Node 18+, `npm install`, `npm start`, set the same env vars. Bind to `0.0.0.0` and `process.env.PORT` (already how this repo runs).

---

## 3) Deploy the frontend (Vite)

Build-time env: **`VITE_API_URL`** must be your **public API** base including `/api`:

```env
VITE_API_URL=https://real-estate-api.onrender.com/api
```

### Vercel

1. Import the Git repo in [Vercel](https://vercel.com).
2. **Root directory**: `frontend`
3. **Framework**: Vite (auto-detected).
4. **Build command**: `npm run build`
5. **Output directory**: `dist`
6. **Environment variables** → add `VITE_API_URL` (Production).
7. This repo includes `frontend/vercel.json` for SPA routing (client-side routes).

Redeploy after changing `VITE_API_URL`.

### Netlify

- **Base directory**: `frontend`
- **Build**: `npm run build`
- **Publish**: `frontend/dist`
- **Env**: `VITE_API_URL`
- Add redirect: `/*` → `/index.html` (SPA fallback); see Netlify docs for `_redirects` or `netlify.toml`.

---

## 4) Smoke test after deploy

1. Open `https://your-frontend/...` → sign up / login.
2. `GET https://your-api.onrender.com/api/health` → `{ "ok": true }`
3. Upload a property as seller — if CORS errors appear, fix **`CLIENT_ORIGINS`** on the API to match the frontend origin exactly.

---

## 5) Optional: `render.yaml` (Render Blueprint)

This repo includes **`render.yaml`** at the root. You can connect the repo to Render and use **Blueprint** to create a web service from it (still set secrets like `MONGO_URI` and `JWT_SECRET` in the dashboard).

---

## Checklist

- [ ] Atlas cluster + DB user + **Network Access** allows your API servers  
- [ ] API env: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGINS` = frontend URL  
- [ ] Frontend env: `VITE_API_URL` = `https://<api-host>/api`  
- [ ] HTTPS on both sides (Vercel/Render provide it)  
- [ ] Plan for **persistent uploads** before going live with real users  

See also **`README.md`** for local development.
