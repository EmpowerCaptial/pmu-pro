const { PrismaClient } = require('@prisma/client');

async function testPrismaSchemaIssue() {
  console.log('🔍 TESTING PRISMA SCHEMA ISSUE...');
  
  // Test 1: Check if we can create a user with the current schema
  console.log('\n📊 Test 1: Attempting to create a test user...');
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Try to create a user with minimal data
    const testUser = await prisma.user.create({
      data: {
        email: 'prisma-test@example.com',
        name: 'Prisma Test User',
        password: 'hashedpassword123',
        role: 'artist',
        selectedPlan: 'starter',
        hasActiveSubscription: false,
        isLicenseVerified: false,
        businessName: 'Test Business',
        studioName: 'Test Studio'
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });
    
    console.log('✅ User creation successful:', testUser);
    
    // Clean up
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Test user cleaned up');
    
  } catch (error) {
    console.error('❌ User creation failed:', error);
    
    if (error.message.includes('emailNotifications')) {
      console.log('🔍 Issue confirmed: emailNotifications column problem');
      
      // Try to check what columns actually exist
      console.log('\n📊 Checking actual database schema...');
      try {
        const columns = await prisma.$queryRaw`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = 'users'
          ORDER BY ordinal_position;
        `;
        console.log('📝 Database columns:');
        columns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
      } catch (schemaError) {
        console.error('❌ Error checking schema:', schemaError);
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  // Test 2: Check Prisma schema file
  console.log('\n📊 Test 2: Checking Prisma schema file...');
  const fs = require('fs');
  const path = require('path');
  
  try {
    const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    const emailNotificationsMatch = schemaContent.match(/emailNotifications\s*:\s*Json\?/);
    if (emailNotificationsMatch) {
      console.log('✅ emailNotifications field found in Prisma schema');
    } else {
      console.log('❌ emailNotifications field NOT found in Prisma schema');
    }
    
    // Check if there are any other Json fields that might be causing issues
    const jsonFields = schemaContent.match(/Json\?/g);
    console.log(`📝 Found ${jsonFields ? jsonFields.length : 0} Json fields in schema`);
    
  } catch (error) {
    console.error('❌ Error reading schema file:', error);
  }

  console.log('\n🎉 Test complete');
}

if (require.main === module) {
  testPrismaSchemaIssue();
}

module.exports = { testPrismaSchemaIssue };
