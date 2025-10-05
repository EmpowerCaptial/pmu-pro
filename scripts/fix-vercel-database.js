const { PrismaClient } = require('@prisma/client');

async function fixVercelDatabase() {
  console.log('🔍 FIXING VERCEL DATABASE (db.prisma.io)...');
  
  // Use the DATABASE_URL that Vercel is actually using
  const vercelDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!vercelDbUrl) {
    console.error('❌ No Vercel database URL found in environment variables');
    process.exit(1);
  }

  console.log('🔍 Using Vercel database URL:', vercelDbUrl.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: vercelDbUrl
      }
    }
  });

  try {
    console.log('🔍 Connecting to Vercel database...');
    await prisma.$connect();
    console.log('✅ Connected to Vercel database');

    // Check if the column exists
    console.log('\n📊 Checking if emailNotifications column exists in Vercel database...');
    const columnExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'emailNotifications'
      );
    `;

    if (columnExists[0].exists) {
      console.log('✅ emailNotifications column already exists in Vercel database');
    } else {
      console.log('❌ emailNotifications column missing in Vercel database');
      console.log('🔧 Adding emailNotifications column to Vercel database...');
      
      await prisma.$executeRaw`
        ALTER TABLE "users"
        ADD COLUMN "emailNotifications" JSONB DEFAULT '{"subscription": true, "payments": true, "settings": true}'::jsonb;
      `;
      console.log('✅ emailNotifications column added successfully to Vercel database');
    }

    // Test the column by trying to select it
    console.log('\n📊 Testing emailNotifications column access in Vercel database...');
    const testUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        emailNotifications: true
      }
    });
    
    if (testUser) {
      console.log('✅ emailNotifications column is accessible in Vercel database:', testUser.emailNotifications);
    } else {
      console.log('⚠️ No users found to test emailNotifications column in Vercel database');
    }

    // Test creating a user to make sure everything works
    console.log('\n📊 Testing user creation in Vercel database...');
    const testUserCreate = await prisma.user.create({
      data: {
        email: 'vercel-test@example.com',
        name: 'Vercel Test User',
        password: 'hashedpassword123',
        role: 'artist',
        selectedPlan: 'starter',
        hasActiveSubscription: false,
        isLicenseVerified: false,
        businessName: 'Test Business',
        studioName: 'Test Studio',
        licenseNumber: 'TEST123',
        licenseState: 'CA'
      },
      select: {
        id: true,
        email: true,
        emailNotifications: true
      }
    });
    
    console.log('✅ User creation successful in Vercel database:', testUserCreate);
    
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUserCreate.id }
    });
    console.log('✅ Test user cleaned up from Vercel database');

    console.log('\n🎉 Vercel database fix complete');

  } catch (error) {
    console.error('❌ Error fixing Vercel database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixVercelDatabase();
}

module.exports = { fixVercelDatabase };
