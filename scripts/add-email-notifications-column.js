const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addEmailNotificationsColumn() {
  try {
    console.log('Adding emailNotifications column to users table...');
    await prisma.$executeRaw`
      ALTER TABLE "users"
      ADD COLUMN "emailNotifications" JSONB DEFAULT '{"subscription": true, "payments": true, "settings": true}'::jsonb;
    `;
    console.log('✅ emailNotifications column added successfully');
  } catch (error) {
    console.error('❌ Error adding emailNotifications column:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addEmailNotificationsColumn();
