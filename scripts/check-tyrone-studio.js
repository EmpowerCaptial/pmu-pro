const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTyrone() {
  try {
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
      console.log('✅ TYRONE:');
      console.log('   ID:', tyrone.id);
      console.log('   Role:', tyrone.role);
      console.log('   Studio Name:', tyrone.studioName);
      console.log('   Business Name:', tyrone.businessName);
      console.log('   Plan:', tyrone.selectedPlan);
      
      // Get team members with same studio
      const teamMembers = await prisma.user.findMany({
        where: { studioName: tyrone.studioName },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          studioName: true
        }
      });
      
      console.log('\n👥 Team members with studio:', tyrone.studioName);
      teamMembers.forEach(m => {
        console.log(`   - ${m.name} (${m.role}) - Studio: ${m.studioName}`);
      });
      
      console.log('\n📋 When adding Jenny, use:');
      console.log(`   studioName: "${tyrone.studioName}"`);
      
    } else {
      console.log('❌ Tyrone not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTyrone();

