const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createServices() {
  try {
    const tyrone = await prisma.user.findUnique({
      where: { email: 'tyronejackboy@gmail.com' }
    });
    
    if (!tyrone) {
      console.log('❌ Tyrone not found');
      return;
    }
    
    console.log('✅ Found Tyrone:', tyrone.id);
    console.log('\n📦 Creating services...');
    
    const services = [
      { name: 'Microblading', price: 450, duration: 120 },
      { name: 'Powder Brows', price: 475, duration: 120 },
      { name: 'Lip Blush', price: 500, duration: 120 },
      { name: 'Eyeliner', price: 350, duration: 90 }
    ];
    
    for (const svc of services) {
      // Check if exists first
      const existing = await prisma.service.findFirst({
        where: {
          userId: tyrone.id,
          name: svc.name
        }
      });
      
      if (!existing) {
        const created = await prisma.service.create({
          data: {
            userId: tyrone.id,
            name: svc.name,
            defaultPrice: svc.price,
            defaultDuration: svc.duration,
            category: 'PMU',
            isActive: true
          }
        });
        console.log(`   ✅ Created: ${created.name} (ID: ${created.id})`);
      } else {
        console.log(`   ℹ️  Already exists: ${svc.name}`);
      }
    }
    
    console.log('\n✅ Done! Tyrone now has services.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createServices();

