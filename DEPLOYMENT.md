# Production Deployment Guide

Deploy **frontend** on Vercel and **backend** on Render, with **MongoDB Atlas** as the database.

## Architecture

```
[Phone/Desktop Browser]  →  HTTPS  →  Vercel (React SPA)
                                              ↓
                                    VITE_API_URL (HTTPS)
                                              ↓
                                    Render (Express API)
                                              ↓
                                    MongoDB Atlas
```

## 1. MongoDB Atlas (Production)

1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Database Access** → create a user with read/write on your database.
3. **Network Access** → add `0.0.0.0/0` (required for Render’s dynamic IPs) or Render’s static outbound IPs if on a paid plan.
4. **Connect** → Drivers → copy the connection string.
5. Use a dedicated database name, e.g. `sensor-inventory`.

Example URI:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/sensor-inventory?retryWrites=true&w=majority
```

## 2. Backend — Render

### Create Web Service

| Setting | Value |
|--------|--------|
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm ci` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/health` |

### Environment Variables

| Key | Value | Required |
|-----|--------|----------|
| `NODE_ENV` | `production` | Yes |
| `MONGO_URI` | Your Atlas connection string | Yes |
| `CLIENT_URL` | Your Vercel URL(s), comma-separated | Yes |

**CLIENT_URL examples:**

```
https://sensor-inventory.vercel.app
```

Multiple origins (production + preview):

```
https://sensor-inventory.vercel.app,https://sensor-inventory-git-main-youruser.vercel.app
```

> After the first Vercel deploy, copy the exact production URL into `CLIENT_URL`, then redeploy Render.

### Verify

Open `https://YOUR-API.onrender.com/api/health` — expect:

```json
{
  "status": "ok",
  "environment": "production",
  "database": "connected"
}
```

> Free Render services spin down after inactivity; the first request may take ~30s.

## 3. Frontend — Vercel

### Import Project

1. Push the repo to GitHub.
2. [vercel.com](https://vercel.com) → **Add New Project** → import repo.
3. **Root Directory:** `frontend`
4. **Framework Preset:** Vite (auto-detected)

### Environment Variables

| Key | Value | Environments |
|-----|--------|----------------|
| `VITE_API_URL` | `https://YOUR-API.onrender.com/api` | Production, Preview |

> `VITE_*` variables are baked in at **build time**. Redeploy after changing them.

### Deploy

Vercel runs `npm run build` and serves `dist/`. SPA routing is configured in `vercel.json`.

### Verify

1. Open your Vercel URL (HTTPS).
2. **Inventory** should load (empty or with data).
3. **Scan** → **Start Camera** → allow permission (HTTPS required on mobile).

## 4. Post-Deploy Checklist

- [ ] Atlas network access allows Render (`0.0.0.0/0` or specific IPs)
- [ ] `MONGO_URI` set on Render
- [ ] `CLIENT_URL` matches Vercel URL exactly (including `https://`, no trailing slash)
- [ ] `VITE_API_URL` points to Render API with `/api` suffix
- [ ] `/api/health` returns `"database": "connected"`
- [ ] Scan + save works on desktop and mobile (HTTPS)

## 5. Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error in browser | Add your Vercel URL to Render `CLIENT_URL` and redeploy backend |
| `Cannot reach API server` | Check `VITE_API_URL`; redeploy Vercel after env changes |
| Camera not working on phone | Use HTTPS (Vercel provides this automatically) |
| Render 503 / slow first load | Free tier cold start; wait or upgrade plan |
| Duplicate index warning | Resolved in production model (unique on `serialNumber` only) |

## 6. Local Production Build Test

```bash
# Backend
cd backend
set NODE_ENV=production
npm start

# Frontend (new terminal)
cd frontend
set VITE_API_URL=http://localhost:5000/api
npm run build
npm run preview
```

Open the preview URL from the terminal output.

## 7. Optional: Custom Domains

- **Vercel:** Project → Settings → Domains
- **Render:** Service → Settings → Custom Domain
- Update `CLIENT_URL` and `VITE_API_URL` to use your custom domains, then redeploy both.
