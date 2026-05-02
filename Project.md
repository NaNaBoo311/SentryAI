# SentryAI — Smart Home Security System

## 📋 Tổng Quan

**SentryAI** là một hệ thống giám sát an ninh thông minh cho nhà ở, sử dụng AI (YOLOv8n) để phát hiện con người trong thời gian thực từ các camera kết nối với trình duyệt.

### Kiến trúc chung
- **Frontend**: React + Vite + Tailwind CSS + Supabase Auth
- **Backend**: FastAPI + YOLOv8n (object detection) + Supabase (database & auth)
- **Database**: Supabase PostgreSQL với RLS (Row Level Security)
- **Deployment**: Docker hỗ trợ cho backend

---

## 🏗️ Cấu trúc Project

```
SentryAI/
├── frontend/              # React application
│   ├── src/
│   │   ├── App.jsx                    # Main app routes
│   │   ├── main.jsx                   # Entry point
│   │   ├── index.css                  # Tailwind styles + custom components
│   │   ├── components/                # Reusable UI components
│   │   │   ├── AuthForm.jsx           # Login/Signup form
│   │   │   ├── CameraCard.jsx         # Individual camera feed card
│   │   │   ├── CameraGrid.jsx         # Grid layout for cameras
│   │   │   ├── DetectionBadge.jsx     # Badge showing detection count
│   │   │   ├── DetectionToggle.jsx    # On/off toggle for detection
│   │   │   ├── EmptyState.jsx         # Empty state UI
│   │   │   ├── HistoryTable.jsx       # Detection history table
│   │   │   ├── LoadingSpinner.jsx     # Loading indicator
│   │   │   └── NotificationToast.jsx  # Toast notifications
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx        # Auth state management (Supabase)
│   │   ├── hooks/
│   │   │   ├── useDeviceCameras.js    # Hook for browser camera enumeration
│   │   │   └── useDetection.js        # Hook for periodic frame capture & inference
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.jsx    # Main layout with sidebar & navbar
│   │   │   ├── Navbar.jsx             # Top navigation bar
│   │   │   └── Sidebar.jsx            # Side navigation menu
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx      # Main dashboard with camera grid
│   │   │   ├── HistoryPage.jsx        # Detection history view
│   │   │   ├── LoginPage.jsx          # Login page
│   │   │   ├── NotificationsPage.jsx  # Notifications center
│   │   │   ├── SettingsPage.jsx       # User settings
│   │   │   └── SignupPage.jsx         # Signup page
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx     # Route wrapper requiring auth
│   │   ├── services/
│   │   │   ├── authService.js         # Auth API calls
│   │   │   ├── cameraService.js       # Camera CRUD via Supabase RPC
│   │   │   ├── detectionService.js    # Detection API calls to backend
│   │   │   ├── notificationService.js # Notification fetching
│   │   │   └── settingsService.js     # User settings via Supabase RPC
│   │   └── utils/
│   │       ├── helpers.js             # Date formatting, confidence formatting
│   │       └── supabaseClient.js      # Supabase client init
│   ├── sqls/                          # Database setup scripts
│   │   ├── cameras.sql                # Camera table & RPC functions
│   │   ├── detection_events.sql       # Detection events table & RPC
│   │   ├── detection_settings.sql     # User detection config & RPC
│   │   ├── notifications.sql          # Notifications table & RPC
│   │   └── profiles.sql               # User profiles table & RPC
│   ├── index.html                     # HTML entry point
│   ├── package.json                   # Dependencies
│   ├── tailwind.config.js             # Tailwind config with custom colors
│   ├── vite.config.js                 # Vite bundler config
│   ├── postcss.config.js              # PostCSS config
│   └── .env                           # Environment variables
│
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── main.py                    # FastAPI app setup, routes mounting, lifespan
│   │   ├── __init__.py
│   │   ├── api/
│   │   │   ├── detection.py           # POST /api/detect/frame, /api/detect/log-event
│   │   │   ├── health.py              # GET /health
│   │   │   └── notifications.py       # POST /api/notifications/create
│   │   ├── core/
│   │   │   ├── config.py              # Settings from .env
│   │   │   └── security.py            # JWT verification from Supabase
│   │   ├── schemas/
│   │   │   └── detection.py           # Pydantic models for detection API
│   │   └── services/
│   │       ├── detector.py            # YOLOv8n model wrapper for person detection
│   │       └── supabase_client.py     # Supabase admin client singleton
│   ├── requirements.txt               # Python dependencies
│   ├── Dockerfile                     # Docker image for backend
│   ├── .env.example                   # Example env file
│   ├── .gitignore
│   ├── .dockerignore
│   └── yolov8n.pt                     # YOLOv8n model weights (for detection)
│
└── README.md              # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (frontend)
- Python 3.11+ (backend)
- Supabase account & project
- Docker (optional, for backend)

### Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add Supabase credentials:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# VITE_BACKEND_URL=http://localhost:8000

# Setup database (run SQL scripts in Supabase console)
# Go to Supabase > SQL > paste contents of sqls/*.sql files

# Start dev server
npm run dev
# Opens http://localhost:5173
```

### Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add Supabase & CORS config:
# SUPABASE_URL=...
# SUPABASE_SERVICE_KEY=...
# SUPABASE_JWT_SECRET=...
# CORS_ORIGINS=http://localhost:5173

# Start server
uvicorn app.main:app --reload
# Server runs at http://localhost:8000
```

---

## 🔑 Key Features

### 1. **Authentication**
- Sign up / Sign in with Supabase Auth
- JWT tokens for API authentication
- Protected routes requiring login

### 2. **Camera Management**
- Auto-detect browser video input devices
- Register cameras with custom names
- Enable/disable camera monitoring
- One-to-one mapping between browser device and DB camera record

### 3. **Real-time Detection**
- Periodic frame capture from video elements (default: 1.5-2 sec intervals)
- Send frames to backend for YOLOv8n inference
- Display bounding boxes and confidence scores on live feed
- Log detection events to database
- Debounced logging (max once per 10 sec per camera)

### 4. **Notifications**
- Auto-create notification when person detected
- Mark notifications as read
- Real-time unread count polling
- Toast notifications on new detections

### 5. **Settings**
- Adjust confidence threshold (0.1 - 0.95)
- Enable/disable detection globally
- User profile management (name, email)

### 6. **History**
- View past detection events with timestamps
- Paginated table (25 items per page)
- Confidence indicators with color coding

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Vite** | Fast bundler |
| **Tailwind CSS 3** | Styling with custom "sentry" color palette |
| **React Router 6** | Client-side routing |
| **Supabase JS** | Auth & database queries |
| **Lucide React** | Icons |
| **React Hot Toast** | Toast notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | Web framework |
| **Uvicorn** | ASGI server |
| **YOLOv8n** | Person detection model |
| **Pillow** | Image processing |
| **Supabase Python** | Database & auth |
| **Pydantic** | Data validation |

### Database (Supabase PostgreSQL)
| Table | Purpose |
|-------|---------|
| `profiles` | User profile info |
| `cameras` | User-owned camera records |
| `detection_settings` | Per-user detection config |
| `detection_events` | Logged detection events |
| `notifications` | Notification records |

---

## 📡 API Endpoints

### Backend (`/api/`)

#### Detection
- **POST** `/api/detect/frame` - Send image frame for YOLOv8n inference
  - Headers: `Authorization: Bearer <JWT>`
  - Body: `multipart/form-data` with `file` (image)
  - Returns: `{ detections: [], count: int, frame_width: int, frame_height: int }`

- **POST** `/api/detect/log-event` - Log a detection event
  - Headers: `Authorization: Bearer <JWT>`
  - Body: `{ camera_id, confidence, bbox[], snapshot_url, status }`

- **GET** `/api/detect/status` - Get user's detection settings
  - Headers: `Authorization: Bearer <JWT>`
  - Returns: `{ detection_enabled: bool, confidence_threshold: float }`

#### Notifications
- **POST** `/api/notifications/create` - Create a notification
  - Headers: `Authorization: Bearer <JWT>`
  - Body: `{ title, message, detection_event_id }`

#### Health
- **GET** `/health` - Health check
  - Returns: `{ status: "ok" }`

---

## 🗄️ Database Schema (Supabase)

### Key Tables

**profiles** - User profiles
```sql
id (UUID, PK → auth.users)
email (TEXT)
full_name (TEXT)
avatar_url (TEXT)
created_at, updated_at (TIMESTAMPTZ)
```

**cameras** - Camera records
```sql
id (UUID, PK)
user_id (UUID, FK → auth.users)
name (TEXT)
device_id (TEXT) -- browser device ID
is_active (BOOLEAN)
created_at, updated_at (TIMESTAMPTZ)
UNIQUE(user_id, device_id)
```

**detection_settings** - Detection configuration
```sql
id (UUID, PK)
user_id (UUID, UNIQUE FK → auth.users)
detection_enabled (BOOLEAN, DEFAULT true)
confidence_threshold (REAL, DEFAULT 0.5)
created_at, updated_at (TIMESTAMPTZ)
```

**detection_events** - Detection logs
```sql
id (UUID, PK)
user_id (UUID, FK → auth.users)
camera_id (UUID, FK → cameras)
confidence (REAL)
bbox (JSONB) -- array of bounding boxes
snapshot_url (TEXT)
status (TEXT) -- 'detected', etc.
created_at (TIMESTAMPTZ)
```

**notifications** - Notification records
```sql
id (UUID, PK)
user_id (UUID, FK → auth.users)
title (TEXT)
message (TEXT)
is_read (BOOLEAN, DEFAULT false)
detection_event_id (UUID, FK → detection_events)
created_at (TIMESTAMPTZ)
```

### RPC Functions (Supabase)
All database operations go through Supabase RPC functions with RLS (Row Level Security):
- `get_my_cameras()` - List user's cameras
- `upsert_camera(name, device_id)` - Create/update camera
- `delete_camera(camera_id)` - Delete camera
- `set_camera_active(camera_id, is_active)` - Toggle camera
- `get_my_detection_settings()` - Get settings
- `update_detection_settings(enabled, threshold)` - Update settings
- `get_my_profile()` - Get profile
- `update_my_profile(full_name, avatar_url)` - Update profile
- `get_my_notifications(limit, offset)` - Fetch notifications
- `mark_notification_read(notification_id)` - Mark read
- `mark_all_notifications_read()` - Mark all read
- `get_unread_notification_count()` - Unread count
- `get_detection_history(limit, offset)` - Detection events
- `log_detection_event(...)` - Log new detection

---

## 🎨 Frontend Design System

### Color Palette (Tailwind: `sentry-*`)
- **sentry-50**: `#0f172a` (darkest)
- **sentry-100**: `#1e293b`
- **sentry-200**: `#334155`
- **sentry-300**: `#475569`
- **sentry-400**: `#0284c7` (accent)
- **sentry-500**: `#0ea5e9` (primary)
- **sentry-600**: `#0284c7`
- **sentry-700**: `#93c5fd`
- **sentry-800**: `#e0f2fe`
- **sentry-900**: `#ffffff`
- **sentry-950**: `#f0f9ff` (background)

### Custom CSS Classes (in `index.css`)
- `.glass-card` - Glassmorphism card component
- `.btn-primary` / `.btn-secondary` / `.btn-danger` - Buttons
- `.input-field` - Form inputs
- `.page-container` / `.page-title` / `.page-subtitle` - Page layout
- `.status-badge` / `.status-active` / `.status-inactive` - Status indicators

---

## 🔐 Security

### Authentication Flow
1. User signs up/in → Supabase Auth creates JWT token
2. Frontend stores session in `AuthContext`
3. API calls include `Authorization: Bearer <JWT>` header
4. Backend verifies JWT using Supabase admin client
5. `get_current_user()` dependency extracts `user_id` from token

### Database Security (RLS)
- All tables have Row Level Security enabled
- Policies ensure users can only access their own data
- Sensitive operations use `SECURITY DEFINER` functions
- Backend uses service role key (admin access) for RPC calls

### CORS
- Backend restricts origins (configured in `.env`)
- Only whitelisted domains can make API calls

---

## 📦 Deployment

### Backend (Docker)
```bash
cd backend

# Build image
docker build -t sentryai-backend:latest .

# Run container
docker run -p 8000:8000 \
  -e SUPABASE_URL=... \
  -e SUPABASE_SERVICE_KEY=... \
  -e CORS_ORIGINS=... \
  sentryai-backend:latest
```

### Frontend (Static)
```bash
cd frontend

# Build production bundle
npm run build

# Serve `dist/` folder via nginx/vercel/github pages
```

---

## 🐛 Troubleshooting

### Camera not working
- Check browser permissions for camera access
- Ensure camera device is not in use by other apps
- Try reloading the page

### Detection not triggering
- Verify detection is enabled in Settings
- Check backend logs: `docker logs <container_id>`
- Ensure confidence threshold is not too high

### Auth failing
- Verify Supabase URL & keys in `.env`
- Check JWT secret matches Supabase project
- Try signing up with new account

### Bounding boxes misaligned
- Ensure video element dimensions match canvas dimensions
- Check `frameDimensions` from `useDetection()` hook

---

## 📝 Environment Variables

### Frontend (`.env`)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BACKEND_URL=http://localhost:8000
```

### Backend (`.env`)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
YOLO_CONFIDENCE_THRESHOLD=0.5
```

---

## 📚 Key Concepts

### How Detection Works
1. **Capture**: `useDetection` hook captures video frames at intervals
2. **Send**: Frame sent to backend as multipart form data
3. **Infer**: YOLOv8n runs person-only detection on backend
4. **Return**: Detections (bbox, confidence) sent back to frontend
5. **Render**: Bounding boxes overlaid on live video feed
6. **Log**: Top detection logged to database (debounced)
7. **Notify**: Auto-created notification triggers toast & stores in DB

### Component Hierarchy
```
App
├── AuthProvider
│   ├── BrowserRouter
│   │   ├── LoginPage / SignupPage
│   │   └── ProtectedRoute
│   │       └── DashboardLayout
│   │           ├── Sidebar (nav)
│   │           ├── Navbar (header)
│   │           └── Pages
│   │               ├── DashboardPage
│   │               │   └── CameraGrid
│   │               │       └── CameraCard (stream + detection)
│   │               ├── HistoryPage
│   │               ├── NotificationsPage
│   │               └── SettingsPage
│   └── Toaster (react-hot-toast)
```

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/xyz`
2. Make changes with clear commits
3. Test locally (both frontend & backend)
4. Push & create PR

---

## 📄 License

MIT License - feel free to use for personal/commercial projects

---

## 📞 Support

For issues, feature requests, or questions:
- Check existing GitHub issues
- Create new issue with detailed description
- Include browser/OS info & screenshots

---

**Last Updated**: 2024
**Version**: 1.0.0