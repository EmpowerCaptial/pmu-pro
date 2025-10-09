const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTyroneOwner() {
  try {
    console.log('🔧 Creating/Updating Tyrone as studio owner...\n');
    
    const password = await bcrypt.hash('tyrone2024', 12);
    
    const tyrone = await prisma.user.upsert({
      where: { email: 'tyronejackboy@gmail.com' },
      update: {
        role: 'owner',
        selectedPlan: 'studio',
        hasActiveSubscription: true,
        studioName: 'Universal Beauty Studio Academy',
        businessName: 'Tyrone Jackson Beauty Studio'
      },
      create: {
        email: 'tyronejackboy@gmail.com',
        name: 'Tyrone Jackson',
        password: password,
        role: 'owner',
        selectedPlan: 'studio',
        hasActiveSubscription: true,
        isLicenseVerified: true,
        studioName: 'Universal Beauty Studio Academy',
        businessName: 'Tyrone Jackson Beauty Studio',
        licenseNumber: 'TJ-PMU-2024',
        licenseState: 'CA'
      }
    });
    
    console.log('✅ Tyrone account ready:');
    console.log('   ID:', tyrone.id);
    console.log('   Email: tyronejackboy@gmail.com');
    console.log('   Password: tyrone2024');
    console.log('   Role:', tyrone.role);
    console.log('   Studio:', tyrone.studioName);
    
    // Create default services
    const defaultServices = [
      { name: 'Microblading', price: 450, duration: 120 },
      { name: 'Powder Brows', price: 475, duration: 120 },
      { name: 'Lip Blush', price: 500, duration: 120 },
      { name: 'Eyeliner', price: 350, duration: 90 }
    ];
    
    console.log('\n📦 Creating services...');
    for (const svc of defaultServices) {
      await prisma.service.upsert({
        where: {
          userId_name: {
            userId: tyrone.id,
            name: svc.name
          }
        },
        update: {},
        create: {
          userId: tyrone.id,
          name: svc.name,
          defaultPrice: svc.price,
          defaultDuration: svc.duration,
          category: 'PMU',
          isActive: true
        }
      });
      console.log(`   ✅ ${svc.name}`);
    }
    
    console.log('\n✅ COMPLETE! Tyrone is now the owner with services.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTyroneOwner();

