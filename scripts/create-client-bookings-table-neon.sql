-- Create client_bookings table with all required fields including isPromo
-- Safe to run multiple times (uses IF NOT EXISTS)

-- Step 1: Create the table
CREATE TABLE IF NOT EXISTS "client_bookings" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "bookingType" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "procedureDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "isPromo" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "contactId" TEXT,
    "staffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "client_bookings_pkey" PRIMARY KEY ("id")
);

-- Step 2: Add isPromo column if table exists but column doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'client_bookings' 
        AND column_name = 'isPromo'
    ) THEN
        ALTER TABLE "client_bookings" 
        ADD COLUMN "isPromo" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS "client_bookings_bookingDate_idx" ON "client_bookings"("bookingDate");
CREATE INDEX IF NOT EXISTS "client_bookings_procedureDate_idx" ON "client_bookings"("procedureDate");
CREATE INDEX IF NOT EXISTS "client_bookings_status_idx" ON "client_bookings"("status");
CREATE INDEX IF NOT EXISTS "client_bookings_contactId_idx" ON "client_bookings"("contactId");

-- Step 4: Add foreign key constraints (only if referenced tables exist)
DO $$ 
BEGIN
    -- Add contactId foreign key
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Contact') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'client_bookings_contactId_fkey'
        ) THEN
            ALTER TABLE "client_bookings" 
            ADD CONSTRAINT "client_bookings_contactId_fkey" 
            FOREIGN KEY ("contactId") 
            REFERENCES "Contact"("id") 
            ON DELETE SET NULL 
            ON UPDATE CASCADE;
        END IF;
    END IF;
    
    -- Add staffId foreign key
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Staff') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'client_bookings_staffId_fkey'
        ) THEN
            ALTER TABLE "client_bookings" 
            ADD CONSTRAINT "client_bookings_staffId_fkey" 
            FOREIGN KEY ("staffId") 
            REFERENCES "Staff"("id") 
            ON DELETE SET NULL 
            ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- Step 5: Verify table creation
SELECT 
    'Table created successfully!' as message,
    COUNT(*) as existing_records
FROM "client_bookings";

