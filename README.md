# Film Photography Manager

A minimalist film photography management system with black, white, and gray aesthetics inspired by Squarespace.

## Features

### 📸 Galleries
- Upload and manage film roll galleries
- Each gallery has a name and description
- Batch upload multiple photos at once
- Beautiful photo grid display

### 🎞️ Film Stock
- Track film inventory with model, format, quantity, and expiry date
- Manual quantity management
- Simple and clean interface

### ✈️ Trips
- Plan future photography trips
- Add destination, dates, and descriptions
- Upload inspiration/reference images
- **View weather forecast for destination**
- **See sunrise/sunset times**
- **Golden hour and blue hour times for perfect lighting**
- Easy trip management

## Tech Stack

- **Backend**: Python FastAPI
- **Frontend**: React + Vite + TailwindCSS
- **Database**: MySQL
- **Storage**: AWS S3 (public-read)
- **UI**: Black/White/Gray minimalist design

## Prerequisites

- Python 3.9+
- Node.js 18+
- MySQL 8.0+
- AWS S3 account and bucket

## Setup Instructions

### 1. Database Setup

```bash
# Create database using MySQL command line
mysql -u root -p < create_database.sql

# Or manually:
mysql -u root -p
CREATE DATABASE photography_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# or: venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Edit backend/.env and add your AWS credentials:
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
# AWS_BUCKET_NAME=your_bucket_name
# AWS_REGION=us-west-1

# Initialize database tables
python init_db.py

# Run backend server
python run.py
# Server will run on http://localhost:8000
# API docs available at http://localhost:8000/docs
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
# Frontend will run on http://localhost:5173
```

### 4. AWS S3 Configuration

1. Create an S3 bucket in AWS Console
2. Set bucket policy to allow public-read access:

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

3. Disable "Block all public access" in bucket settings
4. Add your AWS credentials to `backend/.env`

## Weather and Photography Times

The trips feature includes automatic weather and photography time calculations:

- **Weather Forecast**: Current weather conditions and temperature
- **Sunrise/Sunset**: Exact times for the destination
- **Golden Hour**: Best times for warm, soft lighting
  - Morning: 1 hour after sunrise
  - Evening: 1 hour before sunset
- **Blue Hour**: Perfect for moody, atmospheric shots
  - Morning: 30 minutes before sunrise
  - Evening: 30 minutes after sunset

The system uses free APIs (Open-Meteo and Sunrise-Sunset.org) - no API keys needed!

## Usage

### Create Gallery
1. Go to Galleries section
2. Click "New Gallery"
3. Enter name and description
4. Click "Create"
5. Drag and drop photos or click to upload

### Manage Film Stock
1. Go to Film Stock section
2. Click "New Film Stock"
3. Enter model (e.g., "Kodak Portra 400"), format (e.g., "35mm"), quantity, and expiry date
4. Edit quantity as you use or purchase film

### Plan Trip
1. Go to Trips section
2. Click "New Trip"
3. Enter trip details (name, **destination**, dates, description)
   - **Important**: Add a destination (e.g., "Tokyo", "Paris", "San Francisco") to see weather
4. View automatic weather and photography times
5. Upload inspiration images for reference

## Project Structure

```
photography-app/
├── backend/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic (S3 storage)
│   │   ├── config.py      # Configuration
│   │   ├── database.py    # Database connection
│   │   └── main.py        # FastAPI app
│   ├── init_db.py         # Database initialization
│   ├── run.py             # Development server
│   └── requirements.txt   # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── tailwind.config.js # TailwindCSS config
│
├── create_database.sql    # SQL schema
└── README.md
```

## API Endpoints

### Galleries
- `GET /api/galleries` - List all galleries
- `POST /api/galleries` - Create gallery
- `GET /api/galleries/{id}` - Get gallery details
- `PUT /api/galleries/{id}` - Update gallery
- `DELETE /api/galleries/{id}` - Delete gallery
- `POST /api/galleries/{id}/photos` - Upload photo
- `DELETE /api/galleries/{id}/photos/{photo_id}` - Delete photo

### Film Stocks
- `GET /api/film-stocks` - List all film stocks
- `POST /api/film-stocks` - Create film stock
- `PUT /api/film-stocks/{id}` - Update film stock
- `DELETE /api/film-stocks/{id}` - Delete film stock

### Trips
- `GET /api/trips` - List all trips
- `POST /api/trips` - Create trip
- `GET /api/trips/{id}` - Get trip details
- `PUT /api/trips/{id}` - Update trip
- `DELETE /api/trips/{id}` - Delete trip
- `POST /api/trips/{id}/images` - Upload inspiration image
- `DELETE /api/trips/{id}/images/{image_id}` - Delete image
- `GET /api/trips/{id}/weather` - Get weather, sunrise/sunset, golden/blue hour times

## Environment Variables

### Backend (.env)
```
DATABASE_URL=mysql+pymysql://root:muer0829@localhost:3306/photography_app
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-west-1
AWS_BUCKET_NAME=your_bucket
MAX_UPLOAD_SIZE=10485760
```

## Development

```bash
# Backend
cd backend
source venv/bin/activate
python run.py

# Frontend (in another terminal)
cd frontend
npm run dev
```

## Production Build

```bash
# Frontend
cd frontend
npm run build
# Build files will be in frontend/dist/
```

## Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify credentials in `backend/.env`
- Ensure database `photography_app` exists

### S3 Upload Error
- Verify AWS credentials in `backend/.env`
- Check bucket policy allows public uploads
- Ensure bucket region matches `AWS_REGION`

### CORS Error
- Backend CORS is configured for `localhost:5173` and `localhost:3000`
- Add your domain to `allow_origins` in `backend/app/main.py` if needed

## License

MIT License

## Support

For issues or questions, please create an issue in the repository.

---

Built with ❤️ for film photography enthusiasts

