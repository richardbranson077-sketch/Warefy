# Routes Page Walkthrough

## Introduction
The Routes Page allows you to manage delivery routes, optimize them using AI, and track drivers in real-time.

## Features

### 1. Route Management
- **View Routes**: See a list of all planned, active, and completed routes.
- **Create Route**: Click "New Route" to create a route manually.
    - Enter Origin and Destination addresses.
    - Add Waypoints.
    - Select Optimization Mode (Balanced, Fastest, Shortest).
- **Delete Route**: Remove routes that are no longer needed.

### 2. AI Optimization
- **Optimize**: When creating or editing a route, the system uses Gemini AI (or a mock fallback if API key is missing) to:
    - Reorder stops for efficiency.
    - Estimate fuel and toll costs.
    - Provide insights and recommendations.

### 3. Driver Assignment
- **Assign Driver**: Assign a driver to a planned route.
- **Status Updates**: Routes move from "Planned" to "Assigned" to "In Progress" to "Completed".

### 4. Live Tracking
- **Real-time Map**: View the live location of drivers on active routes.
- **Progress**: See ETA, distance remaining, and stops completed.

## Technical Details

### Backend
- **Router**: `backend/routers/routes.py`
- **Model**: `Route` in `backend/models_lite.py`
- **Database**: SQLite (`backend/warefy.db`)

### Frontend
- **Page**: `frontend/app/dashboard/routes/page.tsx`
- **Service**: `frontend/services/routes.service.ts`

## Troubleshooting

### "Route not found" Error
- Ensure the route ID is correct. The system supports both numeric IDs (e.g., `1`) and string IDs (e.g., `route_1_...`).

### "Network Error"
- Ensure the backend server is running: `uvicorn backend.main:app --reload --port 8000`
- Check if the frontend is pointing to the correct API URL (`http://localhost:8000`).

### "Optimization Failed"
- If Gemini API key is missing, the system falls back to a mock optimization. This is expected behavior in development without an API key.
