const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function findRealJenny() {
  try {
    console.log('🔍 Searching for Jenny\'s real account...\n');
    
    // Find Jenny
    const jenny = await prisma.user.findUnique({
      where: { email: 'jenny@universalbeautystudio.com' }
    });
    
    if (!jenny) {
      console.log('❌ No Jenny account found');
      return;
    }
    
    console.log('✅ Found Jenny:');
    console.log('   ID:', jenny.id);
    console.log('   Email:', jenny.email);
    console.log('   Name:', jenny.name);
    console.log('   Role:', jenny.role);
    
    // Test the password
    const isValidOld = await bcrypt.compare('jennyabshire', jenny.password);
    const isValidNew = await bcrypt.compare('jenny123', jenny.password);
    const isValidTemp = await bcrypt.compare('JennyStudent123!', jenny.password);
    
    console.log('\n🔐 Password Tests:');
    console.log('   jennyabshire:', isValidOld ? '✅ WORKS' : '❌ no');
    console.log('   jenny123:', isValidNew ? '✅ WORKS' : '❌ no');
    console.log('   JennyStudent123!:', isValidTemp ? '✅ WORKS' : '❌ no');
    
    if (!isValidOld) {
      console.log('\n🔧 Setting password to: jennyabshire');
      const hashedPassword = await bcrypt.hash('jennyabshire', 12);
      await prisma.user.update({
        where: { id: jenny.id },
        data: { password: hashedPassword }
      });
      console.log('✅ Password updated!');
    }
    
    console.log('\n📋 USE THIS ID FOR SERVICE ASSIGNMENTS:');
    console.log('   Jenny\'s Database ID:', jenny.id);
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('   Email: jenny@universalbeautystudio.com');
    console.log('   Password: jennyabshire');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findRealJenny();

