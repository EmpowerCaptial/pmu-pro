const { PrismaClient } = require('@prisma/client');

// Use production DATABASE_URL
const prodDbUrl = process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: prodDbUrl
    }
  }
});

async function createTable() {
  try {
    console.log('🔧 Creating service_assignments table in PRODUCTION...\n');
    console.log('Database:', prodDbUrl?.includes('db.prisma.io') ? 'Prisma.io' : prodDbUrl?.includes('neon') ? 'Neon' : 'Unknown');
    
    // Create table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS service_assignments (
        id TEXT PRIMARY KEY,
        "serviceId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        assigned BOOLEAN DEFAULT true,
        "assignedBy" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table created');

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "service_assignments_serviceId_userId_key" 
      ON service_assignments("serviceId", "userId")
    `);
    console.log('✅ Unique index created');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "service_assignments_userId_idx" ON service_assignments("userId")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "service_assignments_serviceId_idx" ON service_assignments("serviceId")
    `);
    console.log('✅ Indexes created');

    // Verify
    const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM service_assignments`);
    console.log('\n✅ SUCCESS! Table verified');
    console.log('   Current rows:', result[0]?.count || 0);
    
    console.log('\n🎉 Now visit: https://thepmuguide.com/migrate-to-database');
    console.log('   And click "Start Migration" - it will work!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('permission denied')) {
      console.log('\n⚠️  Database user lacks CREATE permissions.');
      console.log('   You must run the SQL in Prisma.io dashboard instead.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTable();

