// Create admin user script
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating admin user...');
  
  const hashedPassword = await bcrypt.hash('ubsa2024!', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@thepmuguide.com' },
    update: {},
    create: {
      email: 'admin@thepmuguide.com',
      name: 'PMU Pro Admin',
      password: hashedPassword,
      businessName: 'PMU Pro',
      licenseNumber: 'ADMIN001',
      licenseState: 'CA',
      role: 'owner',
      hasActiveSubscription: true,
      isLicenseVerified: true,
      subscriptionStatus: 'active'
    }
  });
  
  console.log('Admin user created:', { id: user.id, email: user.email, name: user.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
