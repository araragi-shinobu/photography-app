# 🚀 Deployment Guide

This guide covers deploying the Photography App using **Vercel** (frontend) and **Railway** (backend + database).

## 📋 Prerequisites

- GitHub account with your code pushed
- Vercel account (free)
- Railway account (free $5/month credit)
- AWS S3 bucket configured with public read access

---

## 🗄️ Part 1: Deploy Database (Railway)

### Step 1: Create MySQL Database

1. Go to [Railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Provision MySQL"**
4. Wait for database to be created
5. Click on the MySQL service
6. Go to **"Variables"** tab
7. Copy the `DATABASE_URL` value (you'll need this later)

### Step 2: Initialize Database

1. In Railway MySQL service, click **"Data"** tab
2. Click **"Query"** button
3. Copy the contents of `backend/init_railway_db.sql`
4. Paste and execute the SQL script
5. Verify tables are created by running:
   ```sql
   SHOW TABLES;
   ```

---

## 🔧 Part 2: Deploy Backend (Railway)

### Step 1: Create Web Service

1. In the same Railway project, click **"New"** → **"GitHub Repo"**
2. Connect your GitHub account if not already connected
3. Select your `photography-app` repository
4. Railway will detect it's a Python app

### Step 2: Configure Service

1. Click on the new service
2. Go to **"Settings"** tab
3. Set **Root Directory**: `backend`
4. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step 3: Add Environment Variables

Go to **"Variables"** tab and add:

```bash
# Database (use Railway's internal URL)
DATABASE_URL=${{MySQL.DATABASE_URL}}

# Storage
STORAGE_TYPE=s3

# AWS S3 (replace with your values)
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-west-1
AWS_BUCKET_NAME=photography-app

# Upload settings
MAX_UPLOAD_SIZE=10485760

# Optional: Weather API
WEATHER_API_KEY=your_openweather_api_key
```

### Step 4: Deploy

1. Railway will automatically deploy
2. Wait for deployment to complete (check **"Deployments"** tab)
3. Once deployed, go to **"Settings"** → **"Networking"**
4. Click **"Generate Domain"**
5. Copy your backend URL (e.g., `https://your-app.up.railway.app`)

---

## 🎨 Part 3: Deploy Frontend (Vercel)

### Step 1: Create Project

1. Go to [Vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your `photography-app` repository
4. Vercel will auto-detect it's a Vite app

### Step 2: Configure Build Settings

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)

### Step 3: Update API URL

Before deploying, you need to update the frontend to use your Railway backend URL:

1. Edit `frontend/src/services/api.js`
2. Change line 3:
   ```javascript
   const API_BASE_URL = 'https://your-app.up.railway.app/api';
   ```
3. Replace `your-app.up.railway.app` with your actual Railway domain
4. Commit and push this change

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Vercel will provide your frontend URL (e.g., `https://your-app.vercel.app`)

---

## ✅ Part 4: Verify Deployment

### Test Backend

Visit your Railway URL:
```
https://your-app.up.railway.app/health
```

Should return:
```json
{"status": "healthy"}
```

### Test Frontend

1. Visit your Vercel URL
2. Try creating a gallery
3. Try uploading photos
4. Check if images appear (they should load from S3)

---

## 🔧 Troubleshooting

### CORS Errors

If you see CORS errors in browser console:
- Verify backend CORS is configured with regex pattern
- Check that frontend is using HTTPS for API calls
- Verify Vercel domain matches the CORS pattern

### Database Connection Errors

- Verify `DATABASE_URL` is set correctly in Railway
- Check that MySQL service is running
- Verify tables are created (run `SHOW TABLES;` in Railway Query)

### S3 Upload Errors

- Verify AWS credentials are correct
- Check S3 bucket policy allows public read
- Verify bucket CORS configuration
- Check that ACLs are disabled on bucket

### Images Not Loading

- Check browser console for errors
- Verify S3 URLs are accessible (try opening directly)
- Check bucket is in correct region
- Verify images were actually uploaded to S3

---

## 🔄 Updating Your App

### Backend Updates

1. Push changes to GitHub
2. Railway auto-deploys from `main` branch
3. Check deployment logs in Railway dashboard

### Frontend Updates

1. Update `frontend/src/services/api.js` if needed
2. Push changes to GitHub
3. Vercel auto-deploys from `main` branch
4. Check deployment logs in Vercel dashboard

---

## 💰 Cost Estimate

- **Vercel**: Free (100GB bandwidth/month)
- **Railway**: $5 free credit/month (~500 hours runtime)
- **AWS S3**: ~$0.023/GB storage + $0.09/GB transfer

**Estimated monthly cost**: $0-5 for small usage

---

## 🔐 Security Notes

1. **Never commit `.env` files** - they're in `.gitignore`
2. **Rotate AWS keys** periodically
3. **Use Railway's internal URLs** for database connections
4. **Enable Railway's private networking** for production
5. **Set up monitoring** in Railway dashboard

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

## 🆘 Need Help?

Check the logs:
- **Railway**: Click service → "Deployments" → Click deployment → "View Logs"
- **Vercel**: Click deployment → "Logs" tab
- **Browser**: Open DevTools (F12) → Console tab

