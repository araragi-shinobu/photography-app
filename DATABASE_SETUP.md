# Database Setup Instructions

## Method 1: Automatic Script (Recommended)

Run the setup script:

```bash
cd /Users/muerzhou/Desktop/photography-app
chmod +x setup_database.sh
./setup_database.sh
```

This will:
- Create the database `photography_app`
- Create all tables (galleries, photos, film_stocks, trips, trip_images)
- Show you confirmation

---

## Method 2: Manual Setup

### Step 1: Open MySQL

```bash
mysql -u root -p
# Enter password: muer0829
```

### Step 2: Create Database

```sql
CREATE DATABASE IF NOT EXISTS photography_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE photography_app;
```

### Step 3: Create Tables

Either run the SQL file:
```sql
source /Users/muerzhou/Desktop/photography-app/create_database.sql;
```

Or copy-paste this:
```sql
-- Galleries table
CREATE TABLE IF NOT EXISTS galleries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(500),
    photo_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    gallery_id INT NOT NULL,
    original_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    storage_key VARCHAR(500),
    file_size BIGINT,
    display_order INT DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_gallery (gallery_id),
    INDEX idx_display_order (gallery_id, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Film stocks table
CREATE TABLE IF NOT EXISTS film_stocks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    model VARCHAR(100) NOT NULL,
    format VARCHAR(50),
    quantity INT DEFAULT 0,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    destination VARCHAR(255),
    start_date DATE,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dates (start_date, end_date),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trip images table
CREATE TABLE IF NOT EXISTS trip_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trip_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    storage_key VARCHAR(500),
    file_size BIGINT,
    caption VARCHAR(255),
    display_order INT DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_trip (trip_id),
    INDEX idx_display_order (trip_id, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Step 4: Verify Tables

```sql
SHOW TABLES;
```

You should see:
- galleries
- photos
- film_stocks
- trips
- trip_images

### Step 5: Exit MySQL

```sql
EXIT;
```

---

## Method 3: Using Python Script

After setting up backend:

```bash
cd /Users/muerzhou/Desktop/photography-app/backend
source venv/bin/activate
pip install -r requirements.txt
python init_db.py
```

This uses SQLAlchemy to create tables automatically.

---

## Verify Database is Ready

```bash
mysql -u root -pmuer0829 photography_app -e "SHOW TABLES;"
```

You should see all 5 tables listed.

---

## Troubleshooting

### MySQL not running
```bash
# Check status
mysql.server status

# Start MySQL
mysql.server start

# Or on macOS with Homebrew:
brew services start mysql
```

### Cannot connect
```bash
# Test connection
mysql -u root -pmuer0829 -e "SELECT 1;"

# If fails, check password:
mysql -u root -p
# Then enter password manually
```

### Database already exists
```bash
# Drop and recreate (WARNING: deletes all data!)
mysql -u root -pmuer0829 -e "DROP DATABASE IF EXISTS photography_app; CREATE DATABASE photography_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Tables already exist
This is fine! The scripts use `IF NOT EXISTS` so they won't cause errors.

---

## Quick One-Liner

If you just want to create database quickly:

```bash
cd /Users/muerzhou/Desktop/photography-app && mysql -u root -pmuer0829 < create_database.sql && echo "✅ Database created!"
```

---

## Next Steps After Database Setup

1. Configure backend `.env` file with AWS credentials
2. Install backend dependencies: `cd backend && pip install -r requirements.txt`
3. Start backend: `python run.py`
4. Install frontend dependencies: `cd frontend && npm install`
5. Start frontend: `npm run dev`

🎉 You're ready to go!

