const { PrismaClient } = require('@prisma/client');

const prodDbUrl = "postgres://5890c2e407a85b65bf7dc0b6b8713ba23b23197329c65c44bcd9b99cbf6b1db3:sk_tY0xAe_zsUcKhA6HPxSz2@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: { db: { url: prodDbUrl } }
});

async function checkTyrone() {
  try {
    console.log('🔍 Checking Tyrone\'s profile...\n');
    
    const tyrone = await prisma.user.findUnique({
      where: { email: 'Tyronejackboy@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        selectedPlan: true,
        studioName: true,
        businessName: true
      }
    });
    
    if (!tyrone) {
      console.log('❌ Tyrone not found!');
      return;
    }
    
    console.log('Tyrone\'s profile:');
    console.log('   Name:', tyrone.name);
    console.log('   Email:', tyrone.email);
    console.log('   Role:', tyrone.role);
    console.log('   Plan:', tyrone.selectedPlan);
    console.log('   Studio Name:', tyrone.studioName || '❌ NOT SET');
    console.log('   Business Name:', tyrone.businessName || '❌ NOT SET');
    
    if (!tyrone.studioName || !tyrone.businessName) {
      console.log('\n⚠️ Missing studio/business name - will trigger onboarding redirect');
    } else {
      console.log('\n✅ Profile complete - should NOT redirect to onboarding');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTyrone();

