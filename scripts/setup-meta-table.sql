-- Manual setup script for Meta table
-- Run this in your production database to enable schema versioning

-- Create Meta table if it doesn't exist
CREATE TABLE IF NOT EXISTS "meta" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "meta_pkey" PRIMARY KEY ("key")
);

-- Insert initial schema version if it doesn't exist
INSERT INTO "meta" ("key", "value") 
VALUES ('schemaVersion', '1')
ON CONFLICT ("key") DO NOTHING;

-- Verify the table was created
SELECT * FROM "meta" WHERE "key" = 'schemaVersion';
