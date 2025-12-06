# 🚀 Warefy Quick Reference

## Current Status: ✅ All Systems Operational

### Servers Running
- **Backend:** http://localhost:8000 (Running 4+ hours)
- **Frontend:** http://localhost:3000 (Running 4+ hours)
- **Database:** SQLite (`backend/warefy.db`)

---

## Login Credentials

| User | Username | Password | Role |
|------|----------|----------|------|
| Admin | `admin` | `admin123` | admin |
| Manager | `manager` | `manager123` | manager |

---

## Recently Fixed Issues ✅

1. **Admin Users Page** - Now loads without crashing
2. **Warehouses API** - CORS errors resolved
3. **Inventory API** - CORS errors resolved
4. **Dashboard Styling** - CSS now loading properly

---

## Quick Commands

### Restart Backend
```bash
cd /Users/hendrixjohn/warefy
lsof -ti:8000 | xargs kill -9 2>/dev/null
python3 -m uvicorn backend.main_lite:app --host 0.0.0.0 --port 8000 --reload
```

### Restart Frontend
```bash
cd /Users/hendrixjohn/warefy/frontend
lsof -ti:3000 | xargs kill -9 2>/dev/null
npm run dev
```

### Test API Endpoints
```bash
# Dashboard stats
curl http://localhost:8000/api/v1/reports/dashboard

# Warehouses
curl http://localhost:8000/api/v1/warehouses

# Inventory
curl http://localhost:8000/api/v1/inventory
```

### Database Backup
```bash
cp backend/warefy.db backups/warefy_$(date +%Y%m%d_%H%M%S).db
```

---

## Key Pages to Test

### Working Pages ✅
- `/dashboard` - Main dashboard
- `/dashboard/admin/users` - User management (just fixed!)
- `/dashboard/inventory` - Inventory management (just fixed!)
- `/dashboard/orders` - Order management
- `/dashboard/profile` - User profile
- `/dashboard/notifications` - Notifications
- `/dashboard/blockchain` - Audit trail

### Pages to Verify
- `/dashboard/warehouses` - Warehouse management
- `/dashboard/vehicles` - Fleet tracking
- `/dashboard/routes` - Route optimization
- `/dashboard/demand` - Demand forecasting
- `/dashboard/ai-command` - AI Command Center

---

## Common Issues & Solutions

### Issue: Page shows "plain" (no styling)
**Solution:** Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Issue: CORS errors
**Solution:** Servers have been restarted, should be fixed. If persists, check browser console.

### Issue: 401 Unauthorized
**Solution:** Login again at http://localhost:3000/login

### Issue: Page crashes
**Solution:** Check browser console for errors, report the error message

---

## Project Structure

```
warefy/
├── backend/
│   ├── main_lite.py          # Main FastAPI app (SQLite)
│   ├── database_lite.py       # SQLite database config
│   ├── models_lite.py         # Database models
│   ├── routers/               # API endpoints
│   │   ├── warehouses_lite.py # Warehouses API (just fixed!)
│   │   ├── inventory.py       # Inventory API (just fixed!)
│   │   ├── users.py           # User management
│   │   └── ...
│   └── warefy.db             # SQLite database
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── page.tsx       # Main dashboard
│   │   │   ├── admin/users/   # User management (just fixed!)
│   │   │   ├── inventory/     # Inventory page
│   │   │   └── ...
│   │   └── login/             # Login page
│   ├── services/              # API services
│   │   ├── users.service.ts   # User API (just updated!)
│   │   └── ...
│   └── components/            # Reusable components
│
├── ROADMAP.md                 # Production roadmap
├── FIXES_APPLIED.md           # Recent fixes (this session)
├── STATUS_REPORT.md           # System status
└── LAUNCH_CHECKLIST.md        # Launch preparation
```

---

## API Endpoints Reference

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update profile

### User Management (Admin)
- `GET /api/v1/users` - List all users
- `POST /api/v1/users` - Create user
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user

### Warehouses
- `GET /api/v1/warehouses` - List warehouses
- `POST /api/v1/warehouses` - Create warehouse
- `GET /api/v1/warehouses/{id}` - Get warehouse

### Inventory
- `GET /api/v1/inventory` - List inventory
- `POST /api/v1/inventory` - Create item
- `PUT /api/v1/inventory/{id}` - Update item
- `DELETE /api/v1/inventory/{id}` - Delete item

### Reports
- `GET /api/v1/reports/dashboard` - Dashboard stats
- `GET /api/v1/reports/top-products` - Top selling products

---

## What to Do Next

### Option 1: Test Everything
1. Open http://localhost:3000
2. Login with admin credentials
3. Click through all sidebar links
4. Report any errors you find

### Option 2: Continue Development
1. Pick a feature from ROADMAP.md
2. Implement it
3. Test it
4. Move to next feature

### Option 3: Prepare for Launch
1. Review LAUNCH_CHECKLIST.md
2. Complete security hardening
3. Set up deployment
4. Go live!

---

## Need Help?

### Documentation
- `ROADMAP.md` - What to build next
- `FIXES_APPLIED.md` - What was just fixed
- `STATUS_REPORT.md` - Current system status
- `LAUNCH_CHECKLIST.md` - How to launch
- `POSTGRES_ALTERNATIVES.md` - Database migration guide

### Logs
- Backend: Check terminal running backend
- Frontend: Check terminal running frontend
- Browser: Open DevTools Console (F12)

---

**Last Updated:** December 3, 2025
**Status:** All systems operational ✅
**Next:** Test the fixes and continue development!
