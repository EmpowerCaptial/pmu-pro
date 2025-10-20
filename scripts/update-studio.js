const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.user.update({
    where: { email: 'tyronejackboy@gmail.com' },
    data: {
      studioName: 'Universal Beauty Studio Academy',
      businessName: 'Universal Beauty Studio - Tyrone Jackson'
    }
  });
  console.log('✅ Updated:', updated.studioName);
  await prisma.$disconnect();
}
main();
