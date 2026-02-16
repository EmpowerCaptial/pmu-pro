-- Run this script on the database that shows "users.locationId does not exist".
-- Safe to run multiple times (uses IF NOT EXISTS / IF NOT EXISTS for indexes).

-- 1. Create locations table if missing
CREATE TABLE IF NOT EXISTS "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "locations_name_key" ON "locations"("name");

-- 2. Add columns to users if missing
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locationId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "hasAllLocationAccess" BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_locationId_fkey') THEN
    ALTER TABLE "users" ADD CONSTRAINT "users_locationId_fkey"
      FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 3. Create attendance table if missing
-- users.id is UUID in this DB, so studentId/instructorId must be UUID for the FK.
-- If you already ran an older version that created attendance with TEXT, we drop and recreate (empty table).
DROP TABLE IF EXISTS "attendance" CASCADE;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance') THEN
    CREATE TABLE "attendance" (
      "id" TEXT NOT NULL,
      "studentId" UUID NOT NULL,
      "instructorId" UUID NOT NULL,
      "locationId" TEXT NOT NULL,
      "date" DATE NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'present',
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
    );
    CREATE UNIQUE INDEX "attendance_studentId_locationId_date_key" ON "attendance"("studentId", "locationId", "date");
    CREATE INDEX "attendance_studentId_idx" ON "attendance"("studentId");
    CREATE INDEX "attendance_instructorId_idx" ON "attendance"("instructorId");
    CREATE INDEX "attendance_locationId_idx" ON "attendance"("locationId");
    CREATE INDEX "attendance_date_idx" ON "attendance"("date");
    CREATE INDEX "attendance_locationId_date_idx" ON "attendance"("locationId", "date");
    ALTER TABLE "attendance" ADD CONSTRAINT "attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    ALTER TABLE "attendance" ADD CONSTRAINT "attendance_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    ALTER TABLE "attendance" ADD CONSTRAINT "attendance_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 4. Add locationId to inventory_items if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inventory_items') THEN
    ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "locationId" TEXT;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_items_locationId_fkey') THEN
      ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_locationId_fkey"
        FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'inventory_items_locationId_idx') THEN
      CREATE INDEX "inventory_items_locationId_idx" ON "inventory_items"("locationId");
    END IF;
  END IF;
END $$;

-- 5. Supervision sessions (student-instructor bookings visible to both)
-- studentId/instructorId use UUID to match users.id when it is UUID.
DROP TABLE IF EXISTS "supervision_sessions" CASCADE;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'supervision_sessions') THEN
    CREATE TABLE "supervision_sessions" (
      "id" TEXT NOT NULL,
      "studentId" UUID NOT NULL,
      "instructorId" UUID NOT NULL,
      "locationId" TEXT,
      "date" DATE NOT NULL,
      "time" TEXT NOT NULL,
      "clientName" TEXT NOT NULL,
      "clientEmail" TEXT,
      "clientPhone" TEXT,
      "serviceName" TEXT NOT NULL,
      "serviceId" TEXT,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "depositSent" BOOLEAN NOT NULL DEFAULT false,
      "depositLink" TEXT,
      "appointmentId" TEXT,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "supervision_sessions_pkey" PRIMARY KEY ("id")
    );
    CREATE INDEX "supervision_sessions_studentId_idx" ON "supervision_sessions"("studentId");
    CREATE INDEX "supervision_sessions_instructorId_idx" ON "supervision_sessions"("instructorId");
    CREATE INDEX "supervision_sessions_locationId_idx" ON "supervision_sessions"("locationId");
    CREATE INDEX "supervision_sessions_date_idx" ON "supervision_sessions"("date");
    ALTER TABLE "supervision_sessions" ADD CONSTRAINT "supervision_sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    ALTER TABLE "supervision_sessions" ADD CONSTRAINT "supervision_sessions_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    ALTER TABLE "supervision_sessions" ADD CONSTRAINT "supervision_sessions_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
