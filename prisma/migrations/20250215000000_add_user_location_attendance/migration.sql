-- Create locations table (for multi-location and attendance)
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

-- Add location columns to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locationId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "hasAllLocationAccess" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_locationId_fkey";
ALTER TABLE "users" ADD CONSTRAINT "users_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create attendance table
CREATE TABLE IF NOT EXISTS "attendance" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'present',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "attendance_studentId_locationId_date_key" ON "attendance"("studentId", "locationId", "date");
CREATE INDEX IF NOT EXISTS "attendance_studentId_idx" ON "attendance"("studentId");
CREATE INDEX IF NOT EXISTS "attendance_instructorId_idx" ON "attendance"("instructorId");
CREATE INDEX IF NOT EXISTS "attendance_locationId_idx" ON "attendance"("locationId");
CREATE INDEX IF NOT EXISTS "attendance_date_idx" ON "attendance"("date");
CREATE INDEX IF NOT EXISTS "attendance_locationId_date_idx" ON "attendance"("locationId", "date");

ALTER TABLE "attendance" DROP CONSTRAINT IF EXISTS "attendance_studentId_fkey";
ALTER TABLE "attendance" DROP CONSTRAINT IF EXISTS "attendance_instructorId_fkey";
ALTER TABLE "attendance" DROP CONSTRAINT IF EXISTS "attendance_locationId_fkey";
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add locationId to inventory_items
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "locationId" TEXT;

ALTER TABLE "inventory_items" DROP CONSTRAINT IF EXISTS "inventory_items_locationId_fkey";
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "inventory_items_locationId_idx" ON "inventory_items"("locationId");
