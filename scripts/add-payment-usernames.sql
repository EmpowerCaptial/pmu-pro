-- Add payment username fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "venmoUsername" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "cashAppUsername" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "stripeConnectAccountId" TEXT UNIQUE;

