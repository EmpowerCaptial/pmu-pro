// Create the Universal Beauty Studio Academy user
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating Universal Beauty Studio Academy user...');
  
  const hashedPassword = await bcrypt.hash('adminteam!', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'universalbeautystudioacademy@gmail.com' },
    update: {},
    create: {
      email: 'universalbeautystudioacademy@gmail.com',
      name: 'Universal Beauty Studio Academy',
      password: hashedPassword,
      businessName: 'Universal Beauty Studio Academy',
      licenseNumber: 'UBSA001',
      licenseState: 'CA',
      role: 'owner',
      hasActiveSubscription: true,
      isLicenseVerified: true,
      subscriptionStatus: 'active'
    }
  });
  
  console.log('Universal Beauty Studio Academy user created:', { 
    id: user.id, 
    email: user.email, 
    name: user.name 
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
