#!/bin/bash

# Photography App Database Setup Script
# Run this script to create the database

echo "🗄️  Setting up Photography App Database..."
echo ""

# Database credentials
DB_USER="root"
DB_PASS="muer0829"
DB_NAME="photography_app"

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed or not in PATH"
    echo "Please install MySQL first: brew install mysql"
    exit 1
fi

echo "✅ MySQL found"
echo ""

# Try to connect to MySQL
if ! mysql -u"$DB_USER" -p"$DB_PASS" -e "SELECT 1;" &> /dev/null; then
    echo "❌ Cannot connect to MySQL with provided credentials"
    echo "Please check:"
    echo "  - MySQL is running: mysql.server status"
    echo "  - Username is correct: $DB_USER"
    echo "  - Password is correct"
    exit 1
fi

echo "✅ MySQL connection successful"
echo ""

# Create database
echo "Creating database '$DB_NAME'..."
mysql -u"$DB_USER" -p"$DB_PASS" << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE $DB_NAME;

-- Show confirmation
SELECT 'Database created successfully!' as Status;
SHOW DATABASES LIKE '$DB_NAME';
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database '$DB_NAME' created successfully!"
    echo ""
else
    echo "❌ Failed to create database"
    exit 1
fi

# Create tables using the SQL file
if [ -f "create_database.sql" ]; then
    echo "Creating tables from SQL file..."
    mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < create_database.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Tables created successfully!"
        echo ""
        
        # Show created tables
        echo "📋 Created tables:"
        mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW TABLES;"
        echo ""
    else
        echo "❌ Failed to create tables"
        exit 1
    fi
else
    echo "⚠️  create_database.sql not found, skipping table creation"
    echo "You can create tables later by running:"
    echo "  mysql -u$DB_USER -p$DB_PASS $DB_NAME < create_database.sql"
    echo ""
fi

echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "1. cd backend"
echo "2. source venv/bin/activate"
echo "3. pip install -r requirements.txt"
echo "4. python run.py"

