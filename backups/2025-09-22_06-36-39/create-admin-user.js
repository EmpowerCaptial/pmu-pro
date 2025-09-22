// Auto-generated seed script
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
      role: 'owner',
      businessName: 'PMU Pro',
      isActive: true
    }
  });
  
  console.log('Admin user created:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });