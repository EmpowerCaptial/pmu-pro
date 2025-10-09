const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listOwners() {
  try {
    const owners = await prisma.user.findMany({
      where: {
        role: { in: ['owner', 'manager'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        businessName: true
      }
    });
    
    console.log(`📋 Found ${owners.length} owners/managers:\n`);
    
    for (const owner of owners) {
      console.log(`👤 ${owner.name}`);
      console.log(`   Email: ${owner.email}`);
      console.log(`   Role: ${owner.role}`);
      console.log(`   Studio: ${owner.studioName || 'None'}`);
      console.log(`   Business: ${owner.businessName || 'None'}`);
      
      // Count services
      const serviceCount = await prisma.service.count({
        where: { userId: owner.id }
      });
      console.log(`   Services: ${serviceCount}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listOwners();

