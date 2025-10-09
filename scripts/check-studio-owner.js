const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStudioOwner() {
  try {
    console.log('🔍 Checking Universal Beauty Studio Academy setup...\n');
    
    // Find Jenny
    const jenny = await prisma.user.findUnique({
      where: { email: 'jenny@universalbeautystudio.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        businessName: true
      }
    });
    
    console.log('👤 Jenny:');
    console.log('   Role:', jenny.role);
    console.log('   Studio Name:', jenny.studioName);
    console.log('   Business Name:', jenny.businessName);
    
    // Find studio owner
    const owner = await prisma.user.findFirst({
      where: {
        studioName: jenny.studioName,
        role: { in: ['owner', 'manager'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true
      }
    });
    
    console.log('\n👑 Studio Owner:');
    if (owner) {
      console.log('   Name:', owner.name);
      console.log('   Email:', owner.email);
      console.log('   Role:', owner.role);
      console.log('   ID:', owner.id);
      
      // Get owner's services
      const services = await prisma.service.findMany({
        where: { userId: owner.id },
        select: {
          id: true,
          name: true,
          defaultPrice: true,
          isActive: true
        }
      });
      
      console.log('\n📦 Owner\'s Services:', services.length);
      services.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.name} - $${s.defaultPrice} (${s.isActive ? 'Active' : 'Inactive'})`);
      });
      
      if (services.length === 0) {
        console.log('\n❌ PROBLEM: Studio owner has NO services!');
        console.log('   The owner needs to create services first.');
      }
    } else {
      console.log('   ❌ NO OWNER FOUND for studio:', jenny.studioName);
      console.log('\n   All users with this studio name:');
      
      const allStudioUsers = await prisma.user.findMany({
        where: { studioName: jenny.studioName },
        select: {
          name: true,
          email: true,
          role: true
        }
      });
      
      allStudioUsers.forEach(u => {
        console.log(`   - ${u.name} (${u.email}) - Role: ${u.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudioOwner();

