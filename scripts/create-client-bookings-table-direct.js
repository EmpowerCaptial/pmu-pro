const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTable() {
  try {
    console.log('🚀 Creating client_bookings table directly...')
    
    // Step 1: Create the table
    await prisma.$executeRawUnsafe(`
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
    `)
    console.log('✅ Table created!')
    
    // Step 2: Create indexes
    const indexes = [
      `CREATE INDEX IF NOT EXISTS "client_bookings_bookingDate_idx" ON "client_bookings"("bookingDate");`,
      `CREATE INDEX IF NOT EXISTS "client_bookings_procedureDate_idx" ON "client_bookings"("procedureDate");`,
      `CREATE INDEX IF NOT EXISTS "client_bookings_status_idx" ON "client_bookings"("status");`,
      `CREATE INDEX IF NOT EXISTS "client_bookings_contactId_idx" ON "client_bookings"("contactId");`
    ]
    
    for (const idx of indexes) {
      try {
        await prisma.$executeRawUnsafe(idx)
        console.log('✅ Index created')
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log('⚠️  Index creation:', error.message.substring(0, 60))
        }
      }
    }
    
    // Step 3: Add foreign keys (simplified approach - check first, then add)
    try {
      // Check if constraint exists
      const fkCheck1 = await prisma.$queryRaw`
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'client_bookings_contactId_fkey';
      `
      
      if (!fkCheck1 || fkCheck1.length === 0) {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "client_bookings" 
          ADD CONSTRAINT "client_bookings_contactId_fkey" 
          FOREIGN KEY ("contactId") 
          REFERENCES "Contact"("id") 
          ON DELETE SET NULL 
          ON UPDATE CASCADE;
        `)
        console.log('✅ Foreign key (contactId) added')
      } else {
        console.log('⏭️  Foreign key (contactId) already exists')
      }
    } catch (error) {
      console.log('⚠️  Foreign key (contactId) error:', error.message.substring(0, 60))
    }
    
    try {
      const fkCheck2 = await prisma.$queryRaw`
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'client_bookings_staffId_fkey';
      `
      
      if (!fkCheck2 || fkCheck2.length === 0) {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "client_bookings" 
          ADD CONSTRAINT "client_bookings_staffId_fkey" 
          FOREIGN KEY ("staffId") 
          REFERENCES "Staff"("id") 
          ON DELETE SET NULL 
          ON UPDATE CASCADE;
        `)
        console.log('✅ Foreign key (staffId) added')
      } else {
        console.log('⏭️  Foreign key (staffId) already exists')
      }
    } catch (error) {
      console.log('⚠️  Foreign key (staffId) error:', error.message.substring(0, 60))
    }
    
    // Step 4: Verify table exists and is accessible
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'client_bookings'
      ) as exists;
    `
    
    if (tableCheck[0].exists) {
      console.log('\n✅ SUCCESS! client_bookings table exists and is ready!')
      
      // Try to access via Prisma
      try {
        const count = await prisma.clientBooking.count()
        console.log(`✅ Prisma can access the table! Record count: ${count}`)
      } catch (error) {
        console.log('⚠️  Table exists but Prisma error:', error.message)
        console.log('💡 You may need to regenerate Prisma client: npx prisma generate')
      }
    } else {
      console.log('❌ Table was not created successfully')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTable()

