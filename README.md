# Sensor Inventory Scanner

Full-stack MERN web application for managing sensor box inventory using OCR from camera images, plus gateway units scanned from barcodes (e.g. `GU300S-00104`). Sensor labels yield type + serial (`S/N: 00871`); gateways are stored in a separate collection with Excel export.

## Tech Stack

| Layer    | Technologies                                      |
| -------- | ------------------------------------------------- |
| Frontend | React (Vite), Tailwind CSS, React Router, Axios, Tesseract.js |
| Backend  | Node.js, Express.js, Mongoose, ExcelJS            |
| Database | MongoDB Atlas                                     |

## Features

- Live camera preview with manual/auto capture
- OCR with grayscale, contrast boost, and center crop preprocessing
- Gateway barcode scan (native `BarcodeDetector` in supported browsers) or manual entry
- Regex validation for sensor type, sensor serial, and gateway serial
- Inventory tables (sensors / gateways) with search, pagination, delete
- Duplicate protection per collection
- Excel export per inventory type
- Dark/light mode, glassmorphism UI, mobile-friendly layout
- Local scan history

## Project Structure

```
sensor-inventory/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── .env.example
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Modern browser with camera access (HTTPS required in production)

## MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with read/write access.
3. Add your IP address (or `0.0.0.0/0` for development) under **Network Access**.
4. Click **Connect** → **Drivers** and copy the connection string.
5. Replace `<password>` and set the database name (e.g. `sensor-inventory`).

## Local Development

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/sensor-inventory?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```

```bash
npm install
npm run dev
```

Server runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

> **Mobile testing:** Use a tunnel (e.g. ngrok) or your LAN IP. Camera APIs require a secure context (HTTPS) on non-localhost devices.

## API Endpoints

| Method | Endpoint              | Description                    |
| ------ | --------------------- | ------------------------------ |
| GET    | `/api/health`         | Health check                   |
| GET    | `/api/sensors`        | List sensors (search, paginate)|
| POST   | `/api/sensors`        | Create sensor                  |
| DELETE | `/api/sensors/:id`    | Delete sensor                  |
| GET    | `/api/sensors/export` | Download sensor Excel file     |
| GET    | `/api/gateways`       | List gateways (search, paginate)|
| POST   | `/api/gateways`       | Create gateway                 |
| DELETE | `/api/gateways/:id`   | Delete gateway                 |
| GET    | `/api/gateways/export`| Download gateway Excel file    |

### Query Parameters (GET `/api/sensors`)

- `page` – page number (default: 1)
- `limit` – items per page (default: 10, max: 100)
- `search` – filter by sensor type, serial, or manufacturer

### Query Parameters (GET `/api/gateways`)

- `page` – page number (default: 1)
- `limit` – items per page (default: 10, max: 100)
- `search` – filter by gateway serial or manufacturer

## OCR Patterns

- **Sensor Type:** `[A-Z]{3}\d{3}-[A-Z]` (e.g. `SVT300-A`)
- **Serial Number:** `S/N:\s*(\d+)` (e.g. `S/N: 00871`)

## Gateway serial format

- **Pattern:** `/^[A-Z0-9]{3,}-[A-Z0-9]{3,}$/i` (e.g. `GU300S-00104`)
- Barcode scanning works best in **Chrome** or **Edge** (Barcode Detection API). Other browsers can use **Enter manually** or a USB wedge scanner into the form field.

## Production readiness

| Area | Features |
|------|----------|
| **Backend** | Helmet, compression, rate limiting, strict CORS in production, graceful shutdown, health check |
| **Frontend** | Optimized Vite build (code splitting), security headers via `vercel.json`, production env validation |
| **Deploy** | Render (`render.yaml`) + Vercel (`vercel.json`) + MongoDB Atlas |

**Full step-by-step guide:** see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick deploy summary

| Platform | Root | Key env vars |
|----------|------|----------------|
| **Render** (API) | `backend` | `NODE_ENV=production`, `MONGO_URI`, `CLIENT_URL` |
| **Vercel** (app) | `frontend` | `VITE_API_URL=https://your-api.onrender.com/api` |
| **Atlas** (DB) | — | Allow `0.0.0.0/0` for Render |

Health check: `GET /api/health`

## Environment Variables

### Backend (`backend/.env`)

| Variable     | Description                          |
| ------------ | ------------------------------------ |
| `NODE_ENV`   | `production` on Render               |
| `PORT`       | Server port (default: 5000)          |
| `MONGO_URI`  | MongoDB Atlas connection string      |
| `CLIENT_URL` | Comma-separated frontend URLs for CORS |

### Frontend (`frontend/.env`)

| Variable       | Description              |
| -------------- | ------------------------ |
| `VITE_API_URL` | Backend API base URL     |

## Scripts

| Location  | Command       | Description        |
| --------- | ------------- | ------------------ |
| backend   | `npm run dev` | Dev server (nodemon)|
| backend   | `npm start`   | Production server  |
| frontend  | `npm run dev` | Vite dev server    |
| frontend  | `npm run build` | Production build |
| frontend  | `npm run preview` | Preview build    |

## License

ISC
