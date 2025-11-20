# Warefy - Railway Deployment Guide

## 🚂 Deploy Warefy to Railway

This guide will help you deploy the Warefy backend to Railway with a PostgreSQL database.

## Prerequisites

1. **GitHub Account** (to push your code)
2. **Railway Account** (free - sign up at [railway.app](https://railway.app))

## Step 1: Push Code to GitHub

If you haven't already, initialize a git repository and push to GitHub:

```bash
cd /Users/hendrixjohn/warefy

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - Warefy AI Supply Chain Optimizer"

# Create a new repository on GitHub, then:
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Railway

### A. Sign Up / Login to Railway
1. Go to [railway.app](https://railway.app)
2. Click "Login" and sign in with GitHub

### B. Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `warefy` repository
4. Railway will auto-detect it's a Python project

### C. Add PostgreSQL Database
1. In your Railway project dashboard, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically provision a PostgreSQL database
4. The `DATABASE_URL` environment variable will be auto-configured

### D. Configure Environment Variables
Click on your backend service → "Variables" tab and add:

```
DATABASE_URL=(auto-configured by Railway)
JWT_SECRET=your-secret-key-change-this-in-production-xyz123
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OPENAI_API_KEY=your-openai-api-key-here (optional)
MAPBOX_API_KEY=your-mapbox-token-here (optional)
CORS_ORIGINS=*
```

### E. Run Database Migrations
After first deployment, run the seed script:
1. Go to your service → "Settings" → "Deploy"
2. Or use Railway CLI:
```bash
railway run python backend/seed_data.py
```

## Step 3: Access Your API

Once deployed, Railway will give you a URL like:
`https://warefy-production.up.railway.app`

Your API will be available at:
- **API Docs**: `https://your-app.up.railway.app/docs`
- **Health Check**: `https://your-app.up.railway.app/health`


## Step 4: Deploy Frontend

### Option A: Vercel (Recommended for Next.js)
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set root directory to `frontend`
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-backend-url.up.railway.app
   ```
5. Deploy!

### Option B: Railway (All-in-One)
1. In your Railway project, click "New" → "GitHub Repo"
2. Select the same `warefy` repository
3. Click "Variables" and add:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-service.up.railway.app
   ```
4. Click "Settings" → "General"
5. Scroll down to "Root Directory" and set it to `/frontend`
6. Railway will detect the `railway.json` we created and deploy automatically.

## Troubleshooting

### Build Fails
- Check Railway build logs
- Ensure `requirements.txt` has all dependencies
- Python version is set correctly in `runtime.txt`

### Database Connection Issues
- Verify `DATABASE_URL` is set
- Check if PostGIS extension is available (Railway PostgreSQL includes it)

### Port Issues
- Railway auto-assigns `$PORT` variable
- Our `Procfile` uses `$PORT` correctly

## Free Tier Limits

Railway free tier includes:
- **$5/month credit** (enough for development)
- **512MB RAM** per service
- **1GB disk** per service
- Auto-sleep after inactivity

## Next Steps

1. Test your API endpoints using the `/docs` interface
2. Deploy frontend to Vercel or Railway
3. Add your OpenAI API key for AI features
4. Monitor usage in Railway dashboard

## Verification

You can verify your backend is running correctly by using the provided health check script:

```bash
# Run locally (requires backend running on port 8000)
python backend/health_check.py
```

## Estimated Deploy Time
- Initial deployment: 5-10 minutes
- Subsequent deployments: 2-3 minutes

---

**Need help?** Railway has excellent documentation at [docs.railway.app](https://docs.railway.app)
