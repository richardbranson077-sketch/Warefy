# Warefy - Render + Netlify Deployment Guide

Complete guide to deploy Warefy backend on Render and frontend on Netlify - 100% FREE!

## 🎯 What We're Deploying

- **Backend (FastAPI)** → Render
- **Database (PostgreSQL)** → Render
- **Frontend (Next.js)** → Netlify

---

## 📋 Prerequisites

1. GitHub account (already done ✅)
2. Render account - Sign up at [render.com](https://render.com)
3. Netlify account - Sign up at [netlify.com](https://netlify.com)

---

## Part 1: Deploy Backend to Render

### Step 1: Sign Up / Login to Render
1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign in with GitHub (recommended)

### Step 2: Create New Blueprint
1. From dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub account if prompted
3. Select repository: **`richardbranson077-sketch/Warefy`**
4. Render will detect `render.yaml` automatically
5. Click **"Apply"**

### Step 3: Configure Services
Render will create:
- ✅ `warefy-backend` - Web Service (FastAPI)
- ✅ `warefy-db` - PostgreSQL Database

**Wait for deployment** (~5-10 minutes for first deploy)

### Step 4: Add Optional Environment Variables
Click on **warefy-backend** service → **Environment**:

**For AI Features (Optional):**
```
OPENAI_API_KEY=sk-your-openai-key-here
MAPBOX_API_KEY=pk.your-mapbox-key-here
```

### Step 5: Get Your Backend URL
1. Click on **warefy-backend** service
2. Copy the URL (looks like: `https://warefy-backend.onrender.com`)
3. Save this - you'll need it for Netlify!

### Step 6: Test Backend
Visit these URLs:
- Health: `https://warefy-backend.onrender.com/health`
- API Docs: `https://warefy-backend.onrender.com/docs`
- Root: `https://warefy-backend.onrender.com/`

### Step 7: Seed Database
1. Go to **warefy-backend** → **Shell** tab
2. Run: `python backend/seed_data.py`
3. Wait for "Database seeded successfully!" message

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Login to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click **"Sign up"** or **"Log in"**
3. Choose **"GitHub"** login

### Step 2: Import Project
1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Select: **`richardbranson077-sketch/Warefy`**

### Step 3: Configure Build Settings
Netlify will auto-detect Next.js, but verify:
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/.next`

### Step 4: Add Environment Variable
Before deploying, click **"Add environment variables"**:

```
NEXT_PUBLIC_API_URL=https://warefy-backend.onrender.com
```

*(Replace with YOUR Render backend URL from Part 1, Step 5)*

### Step 5: Deploy!
1. Click **"Deploy site"**
2. Wait ~3-5 minutes for build
3. Netlify will give you a URL like: `https://random-name.netlify.app`

### Step 6: Custom Domain (Optional)
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Or change the subdomain to something like: `warefy-app.netlify.app`

---

## 🎉 You're Live!

Your app is now deployed:
- **Backend API**: `https://warefy-backend.onrender.com`
- **Frontend**: `https://your-site.netlify.app`

### Default Login Credentials
After seeding:
- **Admin**: `admin` / `admin123`
- **Manager**: `manager` / `manager123`
- **Driver**: `driver1` / `driver123`

---

## 🔧 Important Notes

### Render Free Tier
- ⚠️ **Spins down after 15 min of inactivity**
- First request after sleep takes ~30 seconds to wake up
- 750 hours/month free
- Upgrade to paid ($7/mo) for always-on service

### Netlify Free Tier
- ✅ Unlimited bandwidth
- ✅ Automatic HTTPS
- ✅ 300 build minutes/month
- ✅ Instant cache invalidation

---

## 📝 Environment Variables Reference

### Backend (Render) - Auto-configured
```
DATABASE_URL=postgresql://... (auto-set by Render)
JWT_SECRET=auto-generated
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=*
```

### Backend (Render) - Optional
```
OPENAI_API_KEY=sk-...
MAPBOX_API_KEY=pk....
```

### Frontend (Netlify) - Required
```
NEXT_PUBLIC_API_URL=https://warefy-backend.onrender.com
```

---

## 🚨 Troubleshooting

**Backend won't start:**
- Check Render logs for errors
- Verify `requirements.txt` has all dependencies
- Ensure Python version is 3.11

**Database connection fails:**
- DATABASE_URL should be auto-set
- Check if PostGIS extension is enabled (Render includes it)

**Frontend can't reach backend:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend is running (visit /health endpoint)

**Render service sleeping:**
- This is normal on free tier
- First request wakes it up (~30 sec)
- Consider using UptimeRobot to ping every 14 min

---

## 🎊 Next Steps

1. ✅ Test all features in production
2. ✅ Update frontend to use production API
3. ✅ Monitor usage in Render/Netlify dashboards
4. 📱 Deploy mobile app (if needed)
5. 🔐 Change default passwords in production

---

**Questions?** Check:
- Render Docs: [docs.render.com](https://docs.render.com)
- Netlify Docs: [docs.netlify.com](https://docs.netlify.com)
