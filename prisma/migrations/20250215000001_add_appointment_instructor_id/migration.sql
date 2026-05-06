-- Add instructorId to appointments table for supervision bookings
-- This allows instructors to see appointments assigned to them even if they didn't create them

-- Add instructorId column (nullable - not all appointments have an instructor)
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "instructorId" TEXT;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_instructorId_fkey') THEN
    ALTER TABLE "appointments" ADD CONSTRAINT "appointments_instructorId_fkey"
      FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS "appointments_instructorId_idx" ON "appointments"("instructorId");
