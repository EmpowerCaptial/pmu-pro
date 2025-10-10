-- Create service_assignments table in production
-- This migration adds proper database storage for service assignments
-- Replacing localStorage with reliable, multi-device database storage

CREATE TABLE IF NOT EXISTS service_assignments (
  id VARCHAR PRIMARY KEY,
  "serviceId" VARCHAR NOT NULL,
  "userId" VARCHAR NOT NULL,
  assigned BOOLEAN DEFAULT true,
  "assignedBy" VARCHAR NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "service_assignments_serviceId_userId_key" UNIQUE ("serviceId", "userId")
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "service_assignments_userId_idx" ON service_assignments("userId");
CREATE INDEX IF NOT EXISTS "service_assignments_serviceId_idx" ON service_assignments("serviceId");
CREATE INDEX IF NOT EXISTS "service_assignments_assignedBy_idx" ON service_assignments("assignedBy");

-- Add foreign key constraints
ALTER TABLE service_assignments
  ADD CONSTRAINT "service_assignments_serviceId_fkey" 
  FOREIGN KEY ("serviceId") REFERENCES services(id) ON DELETE CASCADE;

ALTER TABLE service_assignments
  ADD CONSTRAINT "service_assignments_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE service_assignments
  ADD CONSTRAINT "service_assignments_assignedBy_fkey" 
  FOREIGN KEY ("assignedBy") REFERENCES users(id) ON DELETE CASCADE;

-- Success message
SELECT 'Service assignments table created successfully!' as message;

