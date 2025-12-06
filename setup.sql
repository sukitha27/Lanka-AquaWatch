CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alerts_enabled BOOLEAN DEFAULT TRUE,
    email_alerts BOOLEAN DEFAULT FALSE,
    warning_threshold TEXT DEFAULT 'warning',
    preferred_districts TEXT[],
    theme TEXT DEFAULT 'system'
);

-- Favorite locations table
CREATE TABLE IF NOT EXISTS favorite_locations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    station_id TEXT NOT NULL,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Water level history table
CREATE TABLE IF NOT EXISTS water_level_history (
    id SERIAL PRIMARY KEY,
    station_id TEXT NOT NULL,
    level REAL NOT NULL,
    status TEXT NOT NULL,
    trend TEXT NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW()
);