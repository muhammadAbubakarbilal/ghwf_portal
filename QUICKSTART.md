# 🚀 QUICK START — GHWF Portal (Next.js + FastAPI)

## 30-Second Setup

### Terminal 1: Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
→ API running at `http://127.0.0.1:8000`

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```
→ App running at `http://localhost:3000`

---

## Test Login (Pick Any)

| Email | Password |
|-------|----------|
| **superadmin@ghwf.org** | admin123 |
| **manager@ghwf.org** | password123 |
| **exporter@ghwf.org** | password123 |

Or create a **new student account** via the "Create Profile" button.

---

## 🎯 What to Try

1. **Admin Dashboard** → View stats, student registry
2. **Export to Excel** → Download filtered student data
3. **Create Student Account** → Fill out registration form
4. **Print Form** → View printable A4 layout
5. **System Settings** → Update download windows (Super Admin only)

---

## 📚 Full Documentation

See **MIGRATION_README.md** for:
- Architecture overview
- Complete API reference
- All 23 endpoints
- Database schema
- Troubleshooting

---

## ✅ Verified Components

✅ Backend: FastAPI + 23 endpoints + JSON DB  
✅ Frontend: Next.js + 8 React components + Tailwind CSS  
✅ Auth: JWT tokens + role-based access  
✅ Features: All original workflows (100% parity)  

**Ready to use!** 🎉
