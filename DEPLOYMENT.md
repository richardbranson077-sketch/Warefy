# 🚀 Warefy Deployment Guide

This guide will walk you through deploying the Warefy application to production.

## 📦 Prerequisites

1.  **GitHub Account**: Your code must be pushed to a GitHub repository.
2.  **Railway Account**: For deploying the Backend (Python/FastAPI).
3.  **Vercel Account**: For deploying the Frontend (Next.js).

---

## 1️⃣ Backend Deployment (Railway)

We recommend **Railway** because it automatically detects Python apps and provisions a PostgreSQL database easily.

### Steps:

1.  **Login to Railway**: Go to [railway.app](https://railway.app/) and login with GitHub.
2.  **New Project**: Click "New Project" -> "Deploy from GitHub repo".
3.  **Select Repository**: Choose your `warefy` repository.
4.  **Add Database**:
    *   Right-click on the canvas (or click "New") -> "Database" -> "PostgreSQL".
    *   This will create a database and automatically provide a `DATABASE_URL` variable.
5.  **Configure Variables**:
    *   Click on your **Warefy** service card.
    *   Go to the **Variables** tab.
    *   Add the following:
        *   `GEMINI_API_KEY`: Your Google Gemini API Key.
        *   `SECRET_KEY`: A strong random string (e.g., generated with `openssl rand -hex 32`).
        *   `CORS_ORIGINS`: `https://your-vercel-frontend-url.vercel.app` (You will update this *after* deploying the frontend).
        *   `PORT`: `8000` (Railway usually detects this, but good to be explicit).
6.  **Build & Deploy**:
    *   Railway should automatically detect the `Procfile` and `requirements.txt`.
    *   Watch the "Deployments" tab for logs.
7.  **Get URL**:
    *   Once deployed, go to **Settings** -> **Domains** and generate a domain (e.g., `warefy-production.up.railway.app`).
    *   **Copy this URL**. You need it for the frontend.

---

## 2️⃣ Frontend Deployment (Vercel)

### Steps:

1.  **Login to Vercel**: Go to [vercel.com](https://vercel.com/) and login.
2.  **Add New Project**: Click "Add New..." -> "Project".
3.  **Import Repository**: Select your `warefy` repository.
4.  **Configure Project**:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: Click "Edit" and select `frontend`. **(Crucial Step!)**
5.  **Environment Variables**:
    *   Add `NEXT_PUBLIC_API_URL`: The Railway URL you copied earlier (e.g., `https://warefy-production.up.railway.app`).
        *   *Note: Do not add a trailing slash.*
6.  **Deploy**: Click "Deploy".
7.  **Get URL**:
    *   Vercel will give you a domain (e.g., `warefy.vercel.app`).
    *   **Copy this URL**.

---

## 3️⃣ Final Configuration

Now that you have the Frontend URL, go back to **Railway**:

1.  Open your **Warefy** service settings.
2.  Update the `CORS_ORIGINS` variable.
3.  Set it to your Vercel URL (e.g., `https://warefy.vercel.app`).
    *   *Note: No trailing slash.*
4.  Railway will automatically redeploy.

---

## ✅ Verification

1.  Open your Vercel URL.
2.  Login with the admin credentials (if you seeded the DB).
    *   *Note: Since it's a new DB, you might need to run the seeding script manually or via a Railway "Command".*
    *   **To Seed on Railway**:
        *   Go to your Service -> Settings -> Deploy -> Start Command.
        *   Change it temporarily to: `python seed_comprehensive.py && uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
        *   Let it deploy once, then change it back to just `uvicorn...`.

**🎉 You are live!**
