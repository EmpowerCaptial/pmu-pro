const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const newPassword = 'jenny123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const jenny = await prisma.user.update({
      where: { email: 'jenny@universalbeautystudio.com' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Jenny\'s password reset!');
    console.log('   Email: jenny@universalbeautystudio.com');
    console.log('   Password:', newPassword);
    console.log('   User ID:', jenny.id);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();

