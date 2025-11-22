const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const migrationSQL = `
-- CreateTable
CREATE TABLE IF NOT EXISTS "client_bookings" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "bookingType" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "procedureDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "contactId" TEXT,
    "staffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "client_bookings_bookingDate_idx" ON "client_bookings"("bookingDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "client_bookings_procedureDate_idx" ON "client_bookings"("procedureDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "client_bookings_status_idx" ON "client_bookings"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "client_bookings_contactId_idx" ON "client_bookings"("contactId");

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'client_bookings_contactId_fkey'
    ) THEN
        ALTER TABLE "client_bookings" ADD CONSTRAINT "client_bookings_contactId_fkey" 
        FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'client_bookings_staffId_fkey'
    ) THEN
        ALTER TABLE "client_bookings" ADD CONSTRAINT "client_bookings_staffId_fkey" 
        FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
`

async function runMigration() {
  try {
    console.log('🚀 Running Client Bookings migration...')
    
    // Execute complete statements - handle DO blocks as single units
    const statements = [
      // Create table
      `CREATE TABLE IF NOT EXISTS "client_bookings" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "bookingType" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "procedureDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "contactId" TEXT,
    "staffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "client_bookings_pkey" PRIMARY KEY ("id")
);`,
      // Create indexes
      `CREATE INDEX IF NOT EXISTS "client_bookings_bookingDate_idx" ON "client_bookings"("bookingDate");`,
      `CREATE INDEX IF NOT EXISTS "client_bookings_procedureDate_idx" ON "client_bookings"("procedureDate");`,
      `CREATE INDEX IF NOT EXISTS "client_bookings_status_idx" ON "client_bookings"("status");`,
      `CREATE INDEX IF NOT EXISTS "client_bookings_contactId_idx" ON "client_bookings"("contactId");`,
      // Add foreign keys using DO blocks
      `DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'client_bookings_contactId_fkey'
    ) THEN
        ALTER TABLE "client_bookings" ADD CONSTRAINT "client_bookings_contactId_fkey" 
        FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;`,
      `DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'client_bookings_staffId_fkey'
    ) THEN
        ALTER TABLE "client_bookings" ADD CONSTRAINT "client_bookings_staffId_fkey" 
        FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;`
    ]
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement)
          console.log('✅ Executed statement successfully')
        } catch (error) {
          // Ignore errors for IF NOT EXISTS constraints
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.message.includes('constraint') && error.message.includes('already')) {
            console.log('⏭️  Skipped (already exists)')
          } else {
            console.error('❌ Error:', error.message)
          }
        }
      }
    }
    
    // Verify table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'client_bookings'
      );
    `
    
    if (tableCheck[0].exists) {
      console.log('✅ Migration completed successfully!')
      console.log('✅ client_bookings table exists!')
    } else {
      console.log('❌ Table was not created')
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

runMigration()
