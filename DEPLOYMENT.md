# 🚀 Quick Deployment Guide

## Step 1: Push to GitHub

```bash
# Create a new repository on GitHub (https://github.com/new)
# Then run these commands:

git remote add origin https://github.com/YOUR_USERNAME/warefy.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Render

1. Go to **https://render.com** and sign up/login
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub account
4. Select your **warefy** repository
5. Render will automatically detect `render.yaml` and create:
   - ✅ PostgreSQL database (warefy-db)
   - ✅ Backend web service (warefy-backend)

6. **Add Environment Variables** in Render dashboard:
   - Go to your backend service
   - Click "Environment"
   - Add: `OPENAI_API_KEY` = `sk-...` (your OpenAI API key)
   - `SECRET_KEY` and `DATABASE_URL` are auto-generated

7. Wait for deployment (2-3 minutes)
8. Copy your backend URL: `https://warefy-backend-xxxx.onrender.com`

## Step 3: Deploy Frontend to Vercel

```bash
cd frontend
npx vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → warefy-frontend
- **Directory?** → ./
- **Override settings?** → No

After deployment:
1. Go to **Vercel Dashboard** → Your project → **Settings** → **Environment Variables**
2. Add:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://warefy-backend-xxxx.onrender.com` (your Render backend URL)
3. Click **"Redeploy"** to apply the environment variable

## Step 4: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://warefy-frontend.vercel.app`)
2. Register a new account
3. Test the features:
   - ✅ Dashboard
   - ✅ AI Reports
   - ✅ Warehouse Map
   - ✅ Integrations

## 🎉 Done!

Your application is now live:
- **Frontend**: `https://warefy-frontend.vercel.app`
- **Backend**: `https://warefy-backend-xxxx.onrender.com`
- **API Docs**: `https://warefy-backend-xxxx.onrender.com/docs`

## ⚠️ Important Notes

1. **Free Tier Limitations:**
   - Render free tier spins down after 15 minutes of inactivity
   - First request after spin-down may take 30-60 seconds
   - Consider upgrading for production use

2. **Database:**
   - PostgreSQL database is automatically created by Render
   - Data persists across deployments
   - Free tier has 1GB storage limit

3. **Environment Variables:**
   - Never commit `.env` files to GitHub
   - Always use Render/Vercel dashboards to set secrets

## 🔧 Troubleshooting

**Backend won't start:**
- Check Render logs for errors
- Verify `OPENAI_API_KEY` is set
- Ensure `requirements.txt` has all dependencies

**Frontend can't connect to backend:**
- Verify `NEXT_PUBLIC_API_URL` is set in Vercel
- Check CORS settings in backend
- Ensure backend URL is correct (no trailing slash)

**Database errors:**
- Check Render database logs
- Verify `DATABASE_URL` is set correctly
- Ensure PostgreSQL service is running

## 📞 Need Help?

- Check the main README.md
- Review Render logs: Dashboard → Your service → Logs
- Review Vercel logs: Dashboard → Your project → Deployments → View logs
