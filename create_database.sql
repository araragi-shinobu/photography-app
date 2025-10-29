-- Create database
CREATE DATABASE IF NOT EXISTS photography_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE photography_app;

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

