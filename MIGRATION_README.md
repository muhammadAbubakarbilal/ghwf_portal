# GHWF Student Registration Portal — Next.js + FastAPI Migration

This is a **complete pixel-perfect migration** of the original Vite+React+Express student registration portal to **Next.js** (frontend) and **FastAPI** (backend) with exact feature parity.

## 📁 Project Structure

```
.
├── frontend/                    # Next.js App Router frontend
│   ├── app/                     # Next.js app directory
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Entry point (renders App)
│   │   └── globals.css         # Tailwind CSS + global styles
│   ├── components/              # React components
│   │   ├── App.tsx             # Main app (auth, tabs, workflows)
│   │   ├── Header.tsx          # Top navigation bar
│   │   ├── Sidebar.tsx         # Left sidebar navigation
│   │   ├── DashboardStats.tsx  # Statistics cards/charts
│   │   ├── StudentFormEditor.tsx# Registration form UI
│   │   ├── AuditLogTable.tsx   # Audit log display
│   │   └── PrintTemplate.tsx   # Printable form layout
│   ├── context/                 # React context providers
│   │   ├── AuthContext.tsx     # JWT authentication state
│   │   └── LanguageContext.tsx # i18n (English only for now)
│   ├── types.ts                # TypeScript interfaces (shared)
│   ├── next.config.mjs         # API rewrites to backend
│   ├── tsconfig.json           # TypeScript config
│   ├── tailwind.config.ts      # Tailwind CSS theme
│   ├── postcss.config.cjs      # PostCSS plugins
│   └── package.json            # Frontend dependencies
│
├── backend/                     # FastAPI backend server
│   ├── app/                     # Application modules
│   │   ├── main.py            # FastAPI routes (all endpoints)
│   │   ├── schemas.py         # Pydantic models (request/response)
│   │   ├── database.py        # JSON file-based database layer
│   │   ├── auth.py            # JWT authentication, token management
│   │   └── __init__.py        # Package marker
│   ├── main.py                # Server entry point (uvicorn runner)
│   ├── requirements.txt        # Python dependencies
│   └── data/                   # Persistent storage
│       └── db.json            # JSON database file
│
├── package.json               # Root (original Vite setup reference)
├── vite.config.ts             # Original Vite config
├── tsconfig.json              # Original TypeScript config
├── index.html                 # Original entry point
├── server.ts                  # Original Express server
└── README.md                  # This file
```

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** 18+ and **npm** (for frontend)
- **Python** 3.9+ (for backend)
- **Git** (to clone/manage the repository)

### 1. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server (defaults to localhost:8000)
python main.py
```

**Backend will start at:** `http://127.0.0.1:8000`
- API documentation (interactive Swagger UI): `http://127.0.0.1:8000/docs`
- OpenAPI JSON: `http://127.0.0.1:8000/openapi.json`

### 2. Frontend Setup (Next.js)

In a **new terminal window**:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

**Frontend will start at:** `http://localhost:3000`

---

## 🔐 Demo Credentials

The system comes pre-populated with sample accounts. Use these to test:

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `superadmin@ghwf.org` | `admin123` |
| **Managing Admin** | `manager@ghwf.org` | `password123` |
| **Download Admin** | `exporter@ghwf.org` | `password123` |

To register as a new **Student**, use the "Create Profile" form on the login page.

---

## 🔄 API Architecture

### API Prefix

All API endpoints are prefixed with `/api/v1`:
```
http://localhost:3000/api/v1/...  (via Next.js rewrite)
http://127.0.0.1:8000/api/v1/...  (direct backend call)
```

### Frontend API Rewrites (`next.config.mjs`)

The Next.js app automatically rewrites API calls from the frontend to the FastAPI backend:
```mjs
async rewrites() {
  return [
    {
      source: '/api/v1/:path*',
      destination: 'http://127.0.0.1:8000/api/v1/:path*'
    }
  ];
}
```

This allows the frontend to call `/api/v1/...` without CORS issues during development.

---

## 📋 Core API Endpoints

### Authentication
- `POST /api/v1/auth/register` — Register new student account
- `POST /api/v1/auth/login` — User login (returns JWT token)
- `GET /api/v1/auth/me` — Get current user profile
- `POST /api/v1/auth/logout` — Logout (blacklist JWT token)

### Student Workflows
- `GET /api/v1/student/form` — Fetch student's form (if submitted)
- `POST /api/v1/student/form` — Submit new registration form
- `PATCH /api/v1/student/form` — Edit form (within 24-hour window)
- `GET /api/v1/student/form/status` — Check submission status & download window
- `POST /api/v1/student/form/download` — Mark form as downloaded (once per year)

### Admin Workflows
- `GET /api/v1/admin/students` — List all student registrations (paginated)
- `GET /api/v1/admin/students/{student_id}` — Get single student details
- `GET /api/v1/admin/stats` — Dashboard statistics

### Export & Audit
- `GET /api/v1/export/excel` — Export filtered students as Excel file
- `GET /api/v1/export/logs` — View export history (audit logs)

### Super Admin Controls
- `GET /api/v1/super-admin/users` — List all admin accounts
- `POST /api/v1/super-admin/users` — Create new admin account
- `PATCH /api/v1/super-admin/users/{user_id}` — Update admin (block/unblock)
- `GET /api/v1/settings` — Get system settings
- `PUT /api/v1/settings` — Update system settings

---

## 🛡️ Authentication & Authorization

### JWT Token Flow

1. User logs in → Backend validates credentials → JWT token issued
2. Frontend stores token in `localStorage` as `ghwf_token`
3. All subsequent requests include: `Authorization: Bearer <token>`
4. Backend validates token signature and checks token expiry
5. Logout → Token added to blacklist (in-memory during server runtime)

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-----------|
| **Student** | Submit/edit own form (24h window), download once per year |
| **Managing Admin** | View all student forms, create new admins |
| **Download Admin** | Export student data to Excel, view export history |
| **Super Admin** | All permissions + manage admin accounts + system settings |

---

## 💾 Database

### Storage

The backend uses **JSON file-based persistence** (no database server required):
- Location: `backend/data/db.json`
- Format: Structured JSON with collections for users, students, settings, audit logs

### Collections

- **users** — Admin and student accounts
- **passwords** — Plaintext passwords (development only; use bcrypt in production)
- **students** — Student registration forms
- **settings** — System configuration (download windows, academic year)
- **audit_logs** — Event history (admin exports, updates)
- **token_blacklist** — Logout tokens (in-memory during runtime)
- **registration_sequence** — Counter for registration number generation

---

## 🎨 UI & Styling

### Tailwind CSS v4

All components use **Tailwind CSS 4.1.14**:
```tsx
// Example component styling
<div className="bg-[#16191E] border border-slate-800 rounded-none p-6">
  <h1 className="text-white font-bold text-lg">Title</h1>
</div>
```

### Dark Theme

The entire UI follows a dark theme:
- Background: `#0F1115` (near-black)
- Cards: `#16191E` (dark gray)
- Borders: `slate-800` (subtle)
- Primary accent: `indigo-600` (interactive elements)

---

## 🔄 Form Workflows

### Student Registration Form (24-Hour Lock)

1. **Submit** → Form locked after 24 hours OR manual admin lock
2. **Edit Window** → 24 hours after submission to correct details
3. **Download** → During active download window (1x only, tracked in DB)
4. **Print** → Browser print dialog (CSS-optimized for PDF export)

### Admin Registry & Export

- **Search/Filter** → By name, registration #, school, district, academic year
- **Pagination** → 25 records/page (configurable)
- **Export to Excel** → Filtered cohorts as `.xlsx` file with full student details
- **Audit Trail** → All exports logged with filters & timestamp

---

## 📝 Environment Variables

### Backend (`.env` or system env)

```bash
# Server
HOST=127.0.0.1
PORT=8000
ENVIRONMENT=development

# JWT
JWT_SECRET=ghwf-jwt-secret-key-2026-safe-default-key-321
```

### Frontend (`.env.local`)

```bash
# Next.js automatically uses http://localhost:3000
# API calls are rewritten to backend via next.config.mjs
```

---

## 🧪 Development Workflow

### Make Changes & Test

**Backend changes:**
```bash
cd backend
# Run server with --reload (auto-restart on file changes)
python main.py
# Backend auto-reloads when any file in app/ changes
```

**Frontend changes:**
```bash
cd frontend
npm run dev
# Frontend hot-reloads on component/style changes
```

### Build for Production

**Backend:**
```bash
# No build step needed (Python runs as-is)
python main.py  # Use production settings
```

**Frontend:**
```bash
cd frontend
npm run build     # Creates .next/ directory
npm run start     # Run optimized production bundle
```

---

## 🔍 Debugging

### Backend API

Visit the **interactive API docs**:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

Try endpoints directly, view request/response payloads.

### Frontend

Use browser **Developer Tools** (F12):
- Network tab: Inspect API calls (should show `/api/v1/...` requests)
- Console: Check authentication state, errors
- Application tab: Verify `localStorage` stores `ghwf_token`

### Database

Inspect the JSON database directly:
```bash
cat backend/data/db.json | python -m json.tool  # Pretty-print
```

---

## 📦 Dependencies

### Frontend (Next.js)
- **next** 14.2.5
- **react** 19.0.1
- **react-dom** 19.0.1
- **tailwindcss** 4.1.14
- **lucide-react** 0.546.0 (icons)
- **typescript** 5.8.2

### Backend (FastAPI)
- **fastapi** 0.115.0
- **uvicorn** 0.23.2 (ASGI server)
- **python-jose** 3.3.0 (JWT handling)
- **openpyxl** 3.1.3 (Excel generation)
- **pydantic** (via FastAPI; data validation)

---

## 🚨 Important Notes for Production

1. **Passwords**: Replace plaintext storage with bcrypt hashing
2. **JWT Secret**: Use a strong, unique secret key (not `ghwf-jwt-secret-...`)
3. **CORS**: Restrict `allow_origins` to your actual frontend domain
4. **Database**: Consider migrating from JSON to PostgreSQL/MongoDB
5. **Token Expiry**: Implement refresh token rotation for security
6. **HTTPS**: Use SSL/TLS in production
7. **Rate Limiting**: Add rate limiting to prevent brute-force attacks
8. **Input Validation**: Strengthen server-side validation

---

## 📚 Migration Reference

This codebase is a direct port from the original stack:

| Original | Migrated To | Notes |
|----------|-------------|-------|
| Vite 6 | Next.js 14 | Same React components, App Router |
| React 19 | React 19 | No changes needed |
| TypeScript | TypeScript | Same tsconfig |
| Tailwind CSS 4 | Tailwind CSS 4 | Identical styling |
| Express.js | FastAPI | Similar auth/routes structure |
| JSON file DB | JSON file DB | Same persistence model |
| jsonwebtoken | python-jose | Equivalent JWT handling |
| SheetJS (xlsx) | openpyxl | Excel export equivalent |

All UI, workflows, and data models remain **pixel-perfect**.

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
# Windows: netstat -ano | findstr :8000
# macOS/Linux: lsof -i :8000

# Use a different port
PORT=8001 python main.py
```

### Frontend can't reach API
- Ensure backend is running at `http://127.0.0.1:8000`
- Check `next.config.mjs` `rewrites` destination URL
- Browser DevTools → Network tab → Check `/api/v1/...` requests

### JSON database is empty
- Delete `backend/data/db.json` to regenerate with sample data
- The system auto-initializes on first server start

---

## 📞 Support

For issues or questions, refer to:
1. API Documentation: `http://127.0.0.1:8000/docs`
2. Component code: `frontend/components/`
3. Route definitions: `backend/app/main.py`
4. Data models: `backend/app/schemas.py` and `frontend/types.ts`

---

**Happy coding! 🚀**
