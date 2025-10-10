-- Run this ONCE in your Neon/Vercel Postgres dashboard
-- This creates the service_assignments table for production

CREATE TABLE IF NOT EXISTS service_assignments (
    id TEXT PRIMARY KEY,
    "serviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    assigned BOOLEAN DEFAULT true,
    "assignedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "service_assignments_serviceId_userId_key" UNIQUE ("serviceId", "userId")
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "service_assignments_userId_idx" ON service_assignments("userId");
CREATE INDEX IF NOT EXISTS "service_assignments_serviceId_idx" ON service_assignments("serviceId");
CREATE INDEX IF NOT EXISTS "service_assignments_assignedBy_idx" ON service_assignments("assignedBy");

-- Add foreign key constraints (only if tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services') THEN
        ALTER TABLE service_assignments
        DROP CONSTRAINT IF EXISTS "service_assignments_serviceId_fkey";
        
        ALTER TABLE service_assignments
        ADD CONSTRAINT "service_assignments_serviceId_fkey" 
        FOREIGN KEY ("serviceId") REFERENCES services(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE service_assignments
        DROP CONSTRAINT IF EXISTS "service_assignments_userId_fkey";
        
        ALTER TABLE service_assignments
        ADD CONSTRAINT "service_assignments_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
        
        ALTER TABLE service_assignments
        DROP CONSTRAINT IF EXISTS "service_assignments_assignedBy_fkey";
        
        ALTER TABLE service_assignments
        ADD CONSTRAINT "service_assignments_assignedBy_fkey" 
        FOREIGN KEY ("assignedBy") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Verify table was created
SELECT 'Service assignments table created successfully!' as message,
       COUNT(*) as existing_assignments
FROM service_assignments;

