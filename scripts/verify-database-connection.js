const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyConnection() {
  try {
    console.log('🔍 Verifying database connection...\n');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('');
    
    // Check total user count
    const totalUsers = await prisma.user.count();
    console.log('Total users in database:', totalUsers);
    
    // Find Tyrone specifically
    const tyrone = await prisma.user.findUnique({
      where: { email: 'tyronejackboy@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        businessName: true,
        selectedPlan: true
      }
    });
    
    if (tyrone) {
      console.log('\n✅ FOUND TYRONE:');
      console.log('   ID:', tyrone.id);
      console.log('   Name:', tyrone.name);
      console.log('   Email:', tyrone.email);
      console.log('   Role:', tyrone.role);
      console.log('   Studio:', tyrone.studioName);
      console.log('   Business:', tyrone.businessName);
      console.log('   Plan:', tyrone.selectedPlan);
      
      // Check his services
      const services = await prisma.service.findMany({
        where: { userId: tyrone.id },
        select: {
          id: true,
          name: true,
          isActive: true
        }
      });
      
      console.log('\n   Services:', services.length);
      services.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.name} (${s.isActive ? 'Active' : 'Inactive'})`);
      });
      
    } else {
      console.log('\n❌ TYRONE NOT FOUND');
    }
    
    // Show all users
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true
      },
      take: 10
    });
    
    console.log('\n📋 First 10 users in database:');
    allUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.name}) - ${u.role}`);
    });
    
  } catch (error) {
    console.error('❌ DATABASE ERROR:', error.message);
    console.error('   This might mean wrong database or connection issue');
  } finally {
    await prisma.$disconnect();
  }
}

verifyConnection();

