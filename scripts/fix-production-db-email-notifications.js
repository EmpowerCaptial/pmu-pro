const { PrismaClient } = require('@prisma/client');

// Use the production database URL from Vercel
const productionDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;

if (!productionDbUrl) {
  console.error('❌ No production database URL found in environment variables');
  process.exit(1);
}

console.log('🔍 Using production database URL:', productionDbUrl.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: productionDbUrl
    }
  }
});

async function fixProductionDatabase() {
  try {
    console.log('🔍 Connecting to production database...');
    await prisma.$connect();
    console.log('✅ Connected to production database');

    // Check if the column exists
    console.log('\n📊 Checking if emailNotifications column exists...');
    const columnExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'emailNotifications'
      );
    `;

    if (columnExists[0].exists) {
      console.log('✅ emailNotifications column already exists in production database');
    } else {
      console.log('❌ emailNotifications column missing in production database');
      console.log('🔧 Adding emailNotifications column...');
      
      await prisma.$executeRaw`
        ALTER TABLE "users"
        ADD COLUMN "emailNotifications" JSONB DEFAULT '{"subscription": true, "payments": true, "settings": true}'::jsonb;
      `;
      console.log('✅ emailNotifications column added successfully to production database');
    }

    // Test the column by trying to select it
    console.log('\n📊 Testing emailNotifications column access...');
    const testUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        emailNotifications: true
      }
    });
    
    if (testUser) {
      console.log('✅ emailNotifications column is accessible:', testUser.emailNotifications);
    } else {
      console.log('⚠️ No users found to test emailNotifications column');
    }

    console.log('\n🎉 Production database fix complete');

  } catch (error) {
    console.error('❌ Error fixing production database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixProductionDatabase();
}

module.exports = { fixProductionDatabase };
