const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findProductionTyrone() {
  try {
    console.log('🔍 Finding PRODUCTION Tyrone account with 7 services...\n');
    
    // Get all users and their service counts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        businessName: true,
        selectedPlan: true,
        _count: {
          select: {
            services: true
          }
        }
      }
    });
    
    console.log(`Found ${users.length} total users:\n`);
    
    for (const user of users) {
      console.log(`👤 ${user.name || 'No Name'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Services: ${user._count.services}`);
      console.log(`   Studio Name: ${user.studioName || 'NOT SET'}`);
      console.log(`   Business Name: ${user.businessName || 'NOT SET'}`);
      
      if (user._count.services === 7) {
        console.log('   🎯 THIS IS THE ONE WITH 7 SERVICES!');
        
        // Get the actual services
        const services = await prisma.service.findMany({
          where: { userId: user.id },
          select: { id: true, name: true, isActive: true }
        });
        
        console.log('\n   Services:');
        services.forEach((s, i) => {
          console.log(`   ${i + 1}. ${s.name} (${s.isActive ? 'Active' : 'Inactive'})`);
        });
        
        const hasStudentTraining = services.some(s => 
          s.name.toLowerCase().includes('student') && s.name.toLowerCase().includes('training')
        );
        
        if (hasStudentTraining) {
          console.log('\n   ✅ CONFIRMED: Has "Student Training" service!');
          console.log('\n   📋 THIS IS THE CORRECT OWNER ACCOUNT');
          console.log(`   Owner ID: ${user.id}`);
          console.log(`   Owner Email: ${user.email}`);
          console.log(`   Current Studio Name: ${user.studioName || 'MISSING'}`);
          console.log(`   Current Business Name: ${user.businessName || 'MISSING'}`);
        }
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findProductionTyrone();

