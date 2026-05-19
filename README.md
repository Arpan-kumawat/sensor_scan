# Sensor Inventory Scanner

Full-stack MERN web application for managing sensor box inventory using OCR from camera images. Scan labels to extract sensor type (e.g. `SVT300-A`) and serial number (`S/N: 00871`), then store records in MongoDB Atlas.

## Tech Stack

| Layer    | Technologies                                      |
| -------- | ------------------------------------------------- |
| Frontend | React (Vite), Tailwind CSS, React Router, Axios, Tesseract.js |
| Backend  | Node.js, Express.js, Mongoose, ExcelJS            |
| Database | MongoDB Atlas                                     |

## Features

- Live camera preview with manual/auto capture
- OCR with grayscale, contrast boost, and center crop preprocessing
- Regex validation for sensor type and serial number
- Inventory table with search, pagination, delete
- Duplicate serial number protection
- Excel export
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
| GET    | `/api/sensors/export` | Download Excel file            |

### Query Parameters (GET `/api/sensors`)

- `page` – page number (default: 1)
- `limit` – items per page (default: 10, max: 100)
- `search` – filter by sensor type, serial, or manufacturer

## OCR Patterns

- **Sensor Type:** `[A-Z]{3}\d{3}-[A-Z]` (e.g. `SVT300-A`)
- **Serial Number:** `S/N:\s*(\d+)` (e.g. `S/N: 00871`)

## Deployment

### Backend (Render)

1. Push the repo to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Set **Root Directory** to `backend`.
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. Add environment variables:
   - `MONGO_URI` – your Atlas connection string
   - `CLIENT_URL` – your Vercel frontend URL (e.g. `https://your-app.vercel.app`)
   - `PORT` – Render sets this automatically; optional override

### Frontend (Vercel)

1. Import the GitHub repo on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. **Framework Preset:** Vite
4. Add environment variable:
   - `VITE_API_URL` – your Render API URL + `/api` (e.g. `https://your-api.onrender.com/api`)
5. Deploy.

### Post-Deploy Checklist

- [ ] MongoDB Atlas network access allows Render/Vercel IPs (or `0.0.0.0/0`)
- [ ] `CLIENT_URL` matches the deployed frontend URL
- [ ] `VITE_API_URL` points to the deployed backend `/api`
- [ ] Site served over HTTPS for mobile camera access

## Environment Variables

### Backend (`backend/.env`)

| Variable     | Description                          |
| ------------ | ------------------------------------ |
| `PORT`       | Server port (default: 5000)          |
| `MONGO_URI`  | MongoDB Atlas connection string      |
| `CLIENT_URL` | Frontend URL for CORS                |

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
