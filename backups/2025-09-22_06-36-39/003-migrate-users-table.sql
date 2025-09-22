-- Migration script to update existing users table with professional authentication fields
-- Run this if you already have an existing users table

-- Add new columns to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS license_state VARCHAR(50),
ADD COLUMN IF NOT EXISTS years_experience VARCHAR(10),
ADD COLUMN IF NOT EXISTS selected_plan VARCHAR(50) DEFAULT 'pro',
ADD COLUMN IF NOT EXISTS license_file VARCHAR(255),
ADD COLUMN IF NOT EXISTS insurance_file VARCHAR(255),
ADD COLUMN IF NOT EXISTS has_active_subscription BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_license_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive';

-- Update existing columns to NOT NULL where appropriate (be careful with existing data)
-- Uncomment these lines if you're sure your existing data can handle these constraints:
-- ALTER TABLE users ALTER COLUMN name SET NOT NULL;
-- ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Create new indexes for professional authentication
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(has_active_subscription);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(is_license_verified);
CREATE INDEX IF NOT EXISTS idx_users_license_number ON users(license_number);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- Add constraints for plan validation
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_selected_plan 
CHECK (selected_plan IN ('basic', 'pro', 'premium'));

-- Add constraints for subscription status validation
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_subscription_status 
CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing'));

COMMENT ON TABLE users IS 'Professional PMU artists with authentication and subscription management';
COMMENT ON COLUMN users.license_number IS 'Professional license number for PMU practice';
COMMENT ON COLUMN users.license_state IS 'State/province where license was issued';
COMMENT ON COLUMN users.is_license_verified IS 'Whether license has been manually verified by admin';
COMMENT ON COLUMN users.has_active_subscription IS 'Quick lookup for active subscription status';
COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN users.stripe_subscription_id IS 'Active Stripe subscription ID';
