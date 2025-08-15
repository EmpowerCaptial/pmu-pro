-- PMU Pro Database Schema
-- This script creates the initial database structure

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'artist',
    stripe_id TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    filename TEXT,
    lighting TEXT CHECK (lighting IN ('natural', 'artificial', 'mixed')),
    quality TEXT CHECK (quality IN ('good', 'fair', 'poor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Intakes table (contraindication screening)
CREATE TABLE IF NOT EXISTS intakes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    conditions TEXT[] DEFAULT '{}',
    medications TEXT[] DEFAULT '{}',
    notes TEXT,
    result TEXT CHECK (result IN ('safe', 'precaution', 'not_recommended')),
    rationale TEXT,
    flagged_items TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analyses table (Fitzpatrick & pigment matching)
CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    photo_id TEXT REFERENCES photos(id) ON DELETE SET NULL,
    fitzpatrick INTEGER CHECK (fitzpatrick BETWEEN 1 AND 6),
    undertone TEXT CHECK (undertone IN ('cool', 'neutral', 'warm')),
    confidence DECIMAL(3,2) CHECK (confidence BETWEEN 0.00 AND 1.00),
    recommendation JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pigments table
CREATE TABLE IF NOT EXISTS pigments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    brand TEXT NOT NULL,
    name TEXT NOT NULL,
    base_tone TEXT NOT NULL CHECK (base_tone IN ('warm', 'cool', 'neutral')),
    hue_notes TEXT NOT NULL,
    opacity TEXT NOT NULL CHECK (opacity IN ('low', 'medium', 'high')),
    ideal_fitz TEXT NOT NULL,
    temp_shift TEXT,
    use_case TEXT NOT NULL CHECK (use_case IN ('brows', 'lips', 'liner', 'all')),
    hex_preview TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(brand, name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_client_id ON photos(client_id);
CREATE INDEX IF NOT EXISTS idx_intakes_client_id ON intakes(client_id);
CREATE INDEX IF NOT EXISTS idx_analyses_client_id ON analyses(client_id);
CREATE INDEX IF NOT EXISTS idx_analyses_photo_id ON analyses(photo_id);
CREATE INDEX IF NOT EXISTS idx_pigments_use_case ON pigments(use_case);
CREATE INDEX IF NOT EXISTS idx_pigments_base_tone ON pigments(base_tone);
CREATE INDEX IF NOT EXISTS idx_pigments_active ON pigments(is_active);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_intakes_updated_at BEFORE UPDATE ON intakes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pigments_updated_at BEFORE UPDATE ON pigments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
