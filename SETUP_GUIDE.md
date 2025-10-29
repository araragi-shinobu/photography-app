# Quick Setup Guide

## Step-by-Step Setup

### 1. Create MySQL Database

```bash
mysql -u root -p
# Enter password: muer0829
```

Then in MySQL:
```sql
CREATE DATABASE photography_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Or use the SQL file:
```bash
mysql -u root -pmuer0829 < create_database.sql
```

### 2. Configure Backend Environment

Create `backend/.env` file with the following content:

```env
# Database
DATABASE_URL=mysql+pymysql://root:muer0829@localhost:3306/photography_app

# Storage
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY_HERE
AWS_REGION=us-west-1
AWS_BUCKET_NAME=YOUR_BUCKET_NAME_HERE

# Upload settings
MAX_UPLOAD_SIZE=10485760
```

**Replace the following:**
- `YOUR_AWS_ACCESS_KEY_HERE` - Your AWS Access Key ID
- `YOUR_AWS_SECRET_KEY_HERE` - Your AWS Secret Access Key
- `YOUR_BUCKET_NAME_HERE` - Your S3 bucket name
- `us-west-1` - Your AWS region (if different)

### 3. Install Backend Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt
```

### 4. Initialize Database

```bash
# Still in backend directory, with venv activated
python init_db.py
```

You should see: "✅ Database tables created successfully!"

### 5. Install Frontend Dependencies

Open a new terminal:
```bash
cd frontend
npm install
```

### 6. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python run.py
```
Backend runs on http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

### 7. Open Your Browser

Navigate to: http://localhost:5173

You should see the Film Photography Manager!

## AWS S3 Setup

### Create S3 Bucket

1. Go to AWS Console → S3
2. Click "Create bucket"
3. Choose a unique bucket name
4. Select your region (e.g., us-west-1)
5. **Uncheck** "Block all public access"
6. Click "Create bucket"

### Configure Bucket Policy

1. Go to your bucket → Permissions tab
2. Scroll to "Bucket policy"
3. Click "Edit" and paste:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```

Replace `YOUR_BUCKET_NAME` with your actual bucket name.

### Get AWS Credentials

1. Go to AWS Console → IAM
2. Click "Users" → Your username
3. Go to "Security credentials" tab
4. Click "Create access key"
5. Choose "Application running outside AWS"
6. Copy the Access Key ID and Secret Access Key
7. Add them to `backend/.env`

## Verify Everything Works

1. Go to http://localhost:5173/galleries
2. Click "New Gallery"
3. Create a gallery
4. Try uploading a photo
5. Check if the photo appears

If you see the photo, everything is working! 🎉

## Troubleshooting

### "Module not found" error (Backend)
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### "Cannot find module" error (Frontend)
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### MySQL Connection Error
- Check MySQL is running: `mysql.server status`
- Verify password in `backend/.env`
- Make sure database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### S3 Upload Error
- Check AWS credentials in `backend/.env`
- Verify bucket policy allows public read
- Check bucket region matches your `.env` file

### CORS Error
- Make sure backend is running on port 8000
- Make sure frontend is running on port 5173
- Check browser console for specific error

## What to Try First

1. **Create a Gallery**: Go to Galleries → New Gallery → Name it "Test Roll"
2. **Upload Photos**: Drag and drop 2-3 photos to test batch upload
3. **Add Film Stock**: Go to Film Stock → New Film Stock → Add "Kodak Portra 400, 35mm, qty: 5"
4. **Plan a Trip**: Go to Trips → New Trip → Add "Tokyo 2025" with destination "Tokyo" and dates
5. **View Weather**: Open the trip → See weather forecast, sunrise/sunset, and golden/blue hour times
6. **Add Inspiration**: Upload some reference images

Enjoy managing your film photography! 📸

## New Features

### Weather & Photography Times ☀️

When you create a trip with a destination, the app automatically shows:
- Current weather forecast
- Sunrise and sunset times
- **Golden Hour** times (best for warm, soft light)
- **Blue Hour** times (perfect for moody shots)

No API keys needed - uses free weather APIs!

