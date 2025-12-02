-- Create email_templates table for CRM email template functionality
-- Run this script in your Neon database or production database

CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  "staffId" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT email_templates_staffId_fkey FOREIGN KEY ("staffId") REFERENCES staff(id) ON DELETE CASCADE
);

-- Create index on staffId for faster lookups
CREATE INDEX IF NOT EXISTS email_templates_staffId_idx ON email_templates("staffId");

