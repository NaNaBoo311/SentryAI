## 📋 Project Overview

**SentryAI** is a comprehensive smart home security system combining:
- **🎥 AI-Powered Human Detection**: Real-time person detection using YOLOv8n from browser webcams
- **🔥 Fire Alarm System**: Real-time temperature monitoring via MQTT with fallback simulator mode
- **🔔 Smart Notifications**: Auto-generated alerts with unread count tracking
- **🛡️ Secure Authentication**: Supabase JWT-based auth with Row-Level Security (RLS)
- **📊 Detection History**: Paginated view of all detection events

**Tech Stack:**
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: FastAPI + YOLOv8n + Supabase
- Database: Supabase PostgreSQL with RLS policies
- IoT: MQTT.js for real-time temperature data

---

## 🏗️ Complete Directory Structure

```
SentryAI/
│
├── Project.md                    # Original project documentation
├── README.md                     # Comprehensive README (500+ lines)
│
├── frontend/                     # React + Vite Frontend
│   ├── src/
│   │   ├── App.jsx              # Main router (5 protected routes)
│   │   ├── main.jsx             # React entry point
│   │   ├── index.css            # Tailwind + custom components
│   │   │
│   │   ├── components/          # 10 reusable UI components
│   │   │   ├── AuthForm.jsx
│   │   │   ├── CameraCard.jsx   # Video stream + bounding boxes
│   │   │   ├── CameraGrid.jsx
│   │   │   ├── DetectionBadge.jsx
│   │   │   ├── DetectionToggle.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── HistoryTable.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── NotificationToast.jsx
│   │   │
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # Global auth state + useAuth()
│   │   │
│   │   ├── hooks/
│   │   │   ├── useDeviceCameras.js    # Enumerate video devices
│   │   │   └── useDetection.js        # Capture frames & inference
│   │   │
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Navbar.jsx       # Notifications bell + user menu
│   │   │   └── Sidebar.jsx      # Nav menu with Fire Alarm link
│   │   │
│   │   ├── pages/               # 7 route pages
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   └── FireAlarmPage.jsx       # 🔥 NEW (720 lines)
│   │   │
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── services/            # Supabase RPC + API calls
│   │   │   ├── authService.js
│   │   │   ├── cameraService.js
│   │   │   ├── detectionService.js
│   │   │   ├── fireAlarmService.js     # 🔥 NEW: MQTT client
│   │   │   ├── notificationService.js
│   │   │   └── settingsService.js
│   │   │
│   │   ├── utils/
│   │   │   ├── helpers.js       # formatDateTime(), timeAgo()
│   │   │   └── supabaseClient.js
│   │   │
│   │   └── index.css            # Tailwind setup
│   │
│   ├── sqls/                    # Database setup (7 SQL scripts)
│   │   ├── profiles.sql         # User profiles
│   │   ├── cameras.sql          # Camera records
│   │   ├── detection_settings.sql
│   │   ├── detection_events.sql
│   │   ├── notifications.sql
│   │   ├── fire_settings.sql    # 🔥 NEW: Fire config per user
│   │   └── fire_alerts.sql      # 🔥 NEW: Fire event logs
│   │
│   ├── index.html
│   ├── package.json             # 7 dependencies
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env                     # Local vars (NEVER commit)
│   ├── .env.example
│   └── .gitignore
│
├── backend/                     # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py             # FastAPI setup, CORS, lifespan
│   │   │
│   │   ├── api/                # 4 routers
│   │   │   ├── detection.py    # POST /api/detect/frame
│   │   │   ├── health.py       # GET /health
│   │   │   ├── notifications.py
│   │   │   └── fire.py         # 🔥 NEW: /api/fire/* endpoints
│   │   │
│   │   ├── core/
│   │   │   ├── config.py       # Settings from .env
│   │   │   └── security.py     # JWT verification
│   │   │
│   │   ├── schemas/
│   │   │   └── detection.py    # Pydantic models
│   │   │
│   │   └── services/
│   │       ├── detector.py     # YOLOv8n wrapper
│   │       └── supabase_client.py
│   │
│   ├── requirements.txt        # 10 Python packages
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── yolov8n.pt             # Model weights (6.3 MB)
│   ├── .env
│   ├── .env.example
│   └── .gitignore
│
└── README.md                   # This file (500 lines)
```

---

## 🚀 Quick Start Guide

### **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: Add SUPABASE_URL, ANON_KEY, BACKEND_URL
npm run dev
# Opens http://localhost:5173
```

### **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env: Add SUPABASE credentials
uvicorn app.main:app --reload
# Server at http://localhost:8000
```

### **Database Setup**
Run each SQL script in Supabase console (in order):
1. profiles.sql
2. detection_settings.sql
3. cameras.sql
4. detection_events.sql
5. notifications.sql
6. `sqls/fire_settings.sql` (🔥 NEW)
7. `sqls/fire_alerts.sql` (🔥 NEW)

---

## 🎯 Core Features

### 1️⃣ **Authentication**
- Supabase Auth (email/password)
- JWT tokens for API auth
- Protected routes with ProtectedRoute wrapper
- RLS on all database tables

**Key Files:**
- AuthContext.jsx — auth state
- security.py — JWT verification

### 2️⃣ **Camera Management**
- Auto-detect browser video devices via `navigator.mediaDevices`
- Register cameras in database with custom names
- Enable/disable individual cameras
- One-to-one mapping: browser device ↔ database camera record

**Key Files:**
- useDeviceCameras.js
- CameraCard.jsx
- cameraService.js

### 3️⃣ **Real-time Human Detection**
- Capture frames every 1.5-2 sec from video element
- Send to backend (`POST /api/detect/frame`) for YOLOv8n inference
- Receive bounding boxes + confidence scores
- Overlay boxes on live feed
- Log top detection to database (debounced max once per 10 sec)
- Auto-create notification when detected

**How it works:**
```
Video Stream → useDetection hook → Canvas capture → 
Backend YOLOv8n → Detections returned → 
Bounding boxes rendered → logDetectionEvent → 
Notification auto-created
```

**Key Files:**
- useDetection.js
- detection.py
- detector.py

### 4️⃣ **🔥 Fire Alarm System (NEW)**

**Real Hardware Mode:**
- Connect to OhStem MQTT broker via WebSocket (`wss://mqtt.ohstem.vn:8084/mqtt`)
- Subscribe to `sentryai/temperature` topic
- Receive real-time temperature from Yolo:Bit device
- Trigger alert if temp > 50°C (configurable)

**Simulation Mode:**
- Manual temperature control via slider (0-100°C)
- Perfect for testing without hardware
- Toggle between modes anytime

**Alert Behavior:**
- ✅ Temperature ≤ 50°C: "Safe & Normal" status
- 🔥 Temperature > 50°C: Flashing red alert + audio beep + toast notification

**Key Files:**
- FireAlarmPage.jsx — 720 lines, full UI
- fireAlarmService.js — MQTT client
- fire.py — backend endpoints
- fire_settings.sql — config table
- fire_alerts.sql — event log table

### 5️⃣ **Notifications**
- Auto-created when person detected
- Mark individual as read
- Mark all as read
- Real-time unread count (polls every 15 sec)
- Toast notifications on new detection

**Key Files:**
- NotificationsPage.jsx
- notificationService.js

### 6️⃣ **Settings & Profile**
- Edit full name & email (email read-only)
- Adjust confidence threshold (0.1 - 0.95)
- Toggle detection globally on/off

**Key Files:**
- SettingsPage.jsx

### 7️⃣ **Detection History**
- View all past detection events
- Paginated (25 items per page)
- Confidence indicators with color coding
- Timestamp for each event

**Key Files:**
- HistoryPage.jsx

---

## 🛠️ Tech Stack Details

| Component | Tech | Version |
|-----------|------|---------|
| **Frontend Framework** | React | 18.3.1 |
| **Bundler** | Vite | 5.4.1 |
| **CSS** | Tailwind CSS | 3.4.10 |
| **Routing** | React Router | 6.26.0 |
| **Auth** | Supabase Auth | 2.45.0 |
| **MQTT** | mqtt.js | 5.15.1 |
| **Icons** | Lucide React | 0.441.0 |
| **Toasts** | React Hot Toast | 2.4.1 |
| **Backend** | FastAPI | 0.115.0 |
| **Server** | Uvicorn | 0.30.0 |
| **AI Model** | YOLOv8n | ultralytics 8.3.0 |
| **Image Processing** | Pillow | 10.4.0 |
| **Database** | Supabase PostgreSQL | - |

---

## 📡 API Endpoints

### Detection Endpoints
- `POST /api/detect/frame` — YOLOv8n inference on image
- `POST /api/detect/log-event` — Log detection to database
- `GET /api/detect/status` — Get user's detection settings

### 🔥 Fire Detection Endpoints (NEW)
- `GET /api/fire/temperature` — Get current temperature from IoT device
- `POST /api/fire/check-alert` — Check if fire alert should trigger
- `POST /api/fire/settings` — Update fire settings (threshold, device IP)
- `GET /api/fire/alerts-history` — Fetch fire alert history

### Notifications Endpoints
- `POST /api/notifications/create` — Create notification record

### Health Endpoint
- `GET /health` — Health check

---

## 🗄️ Database Tables

| Table | Purpose | Rows |
|-------|---------|------|
| `auth.users` | Supabase auth | - |
| `profiles` | User profile info | ✓ |
| `cameras` | Camera records | ✓ |
| `detection_settings` | Detection config per user | ✓ |
| `detection_events` | Human detection logs | ✓ |
| **`fire_settings`** | Fire alarm config per user | ✓ NEW |
| **`fire_alerts`** | Fire event logs | ✓ NEW |
| `notifications` | Notification records | ✓ |

---

## 🎨 Design System

### Color Palette (Custom Tailwind: `sentry-*`)
```
sentry-50:  #0f172a  (darkest)
sentry-100: #1e293b
sentry-200: #334155
sentry-300: #475569
sentry-400: #0284c7  (accent)
sentry-500: #0ea5e9  (primary)
sentry-900: #ffffff
sentry-950: #f0f9ff  (background)
```

### Custom CSS Classes
- `.glass-card` — Glassmorphism card
- `.btn-primary` / `.btn-secondary` / `.btn-danger` — Buttons
- `.input-field` — Form inputs
- `.page-container` / `.page-title` / `.page-subtitle` — Layouts
- `.status-badge` / `.status-active` / `.status-alert` — Status indicators

---

## 🔐 Security

- **JWT Authentication**: Supabase Auth with JWT tokens
- **Row-Level Security (RLS)**: All tables have RLS policies (users can only access their own data)
- **CORS**: Backend restricts origins via environment variable
- **Secure Headers**: Authorization header included on all API calls
- **MQTT WebSocket Secure (WSS)**: Fire alarm uses encrypted connection

---

## 📝 Environment Variables

### Frontend `.env`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BACKEND_URL=http://localhost:8000
```

### Backend `.env`
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
YOLO_CONFIDENCE_THRESHOLD=0.5
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Camera not working** | Check browser permissions, reload page |
| **Detection not triggering** | Verify detection enabled in Settings, check backend logs |
| **MQTT connection failed** | Check device IP, firewall, broker status |
| **Login failing** | Verify Supabase URL & keys in `.env` |
| **Bounding boxes misaligned** | Ensure video dimensions match canvas |

---

## 📦 Deployment

### Backend (Docker)
```bash
cd backend
docker build -t sentryai-backend:latest .
docker run -p 8000:8000 \
  -e SUPABASE_URL=... \
  -e SUPABASE_SERVICE_KEY=... \
  sentryai-backend:latest
```

### Frontend (Static)
```bash
cd frontend
npm run build
# Deploy dist/ folder to: Vercel, Netlify, or nginx
```

---

## 🔥 Fire Alarm Configuration Note

### ⚠️ **To Change Fire Alert Temperature Threshold (IMPORTANT)**

The fire alarm threshold is **50°C** by default. To modify it, edit these files:

1. **Frontend - Temperature Display & Alert Logic:**
   - File: FireAlarmPage.jsx
   - Line: **Search for `const TEMPERATURE_THRESHOLD = 50`**
   - Change `50` to your desired threshold (e.g., `55`, `60`, `70`)
   - This controls: Alert trigger, display message, progress bar

2. **Backend - API Response Logic:**
   - File: fire.py
   - Lines: **Find `temperature_threshold = settings.get("temperature_threshold", 50.0)`**
   - Change default from `50.0` to your desired threshold
   - This controls: Backend alert checking, database storage

3. **Database - Default User Setting:**
   - File: fire_settings.sql
   - Line: **Search for `temperature_threshold REAL DEFAULT 50.0`**
   - Change `50.0` to your desired threshold
   - Run this SQL again in Supabase to apply to new users

### Quick Reference
```
FireAlarmPage.jsx    → Line ~1: const TEMPERATURE_THRESHOLD = 50  ← CHANGE HERE
fire.py              → Line ~80: temperature_threshold = ... 50.0  ← CHANGE HERE
fire_settings.sql    → Line ~10: temperature_threshold REAL DEFAULT 50.0  ← CHANGE HERE
```

**Note:** Make sure to change all 3 places for consistency across frontend, backend, and database!

---

## 📚 Component Hierarchy

```
App
└── AuthProvider
    └── BrowserRouter
        ├── LoginPage / SignupPage
        └── ProtectedRoute
            └── DashboardLayout
                ├── Sidebar (nav with Fire Alarm link)
                ├── Navbar (notifications bell)
                └── Pages
                    ├── DashboardPage (camera grid)
                    ├── HistoryPage (detection logs)
                    ├── NotificationsPage (alerts)
                    ├── FireAlarmPage (🔥 MQTT/Simulator)
                    └── SettingsPage (config)
```

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/xyz`
2. Make changes with clear commits
3. Test locally (both frontend & backend)
4. Push & create PR

---

**Version:** 1.1.0 (with Fire Alarm)  
**Last Updated:** 2024  
**Status:** ✅ Fully Functional