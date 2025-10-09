const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function verifyJennyLogin() {
  try {
    console.log('🔍 Checking Jenny\'s account...\n');
    
    const jenny = await prisma.user.findUnique({
      where: { email: 'jenny@universalbeautystudio.com' },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        hasActiveSubscription: true,
        selectedPlan: true
      }
    });
    
    if (!jenny) {
      console.log('❌ Jenny not found!');
      return;
    }
    
    console.log('✅ Jenny exists in database:');
    console.log('   ID:', jenny.id);
    console.log('   Email:', jenny.email);
    console.log('   Name:', jenny.name);
    console.log('   Role:', jenny.role);
    console.log('   Plan:', jenny.selectedPlan);
    console.log('   Active Subscription:', jenny.hasActiveSubscription);
    console.log('   Password Hash:', jenny.password ? 'SET' : 'NOT SET');
    console.log('');
    
    // Test password
    const testPassword = 'JennyStudent123!';
    const isValid = await bcrypt.compare(testPassword, jenny.password);
    
    console.log('🔐 Password Test:');
    console.log('   Test Password:', testPassword);
    console.log('   Password Valid:', isValid ? '✅ YES' : '❌ NO');
    console.log('');
    
    if (!isValid) {
      console.log('🔧 Resetting password...');
      const newPassword = 'Jenny2024!';
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await prisma.user.update({
        where: { id: jenny.id },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Password reset successfully!');
      console.log('   New Password:', newPassword);
      console.log('');
    }
    
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('   Email: jenny@universalbeautystudio.com');
    console.log('   Password:', isValid ? 'JennyStudent123!' : 'Jenny2024!');
    console.log('');
    console.log('   Jenny\'s Database ID:', jenny.id);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyJennyLogin();

