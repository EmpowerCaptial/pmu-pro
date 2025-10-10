const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function findBothJennyAccounts() {
  try {
    console.log('🔍 Searching for ALL Jenny accounts...\n');
    
    // This should only return ONE due to unique email constraint
    // But let's check
    const jenny = await prisma.user.findUnique({
      where: { email: 'jenny@universalbeautystudio.com' }
    });
    
    if (!jenny) {
      console.log('❌ No Jenny account found');
      return;
    }
    
    console.log('📋 Found Jenny Account:');
    console.log('   ID:', jenny.id);
    console.log('   Name:', jenny.name);
    console.log('   Email:', jenny.email);
    console.log('   Role:', jenny.role);
    console.log('   Studio:', jenny.studioName);
    console.log('   Business:', jenny.businessName);
    
    // Test BOTH passwords
    const testPasswords = ['jennyabshire', 'temp839637'];
    
    console.log('\n🔐 Testing Passwords:');
    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, jenny.password);
      console.log(`   ${pwd}: ${isValid ? '✅ WORKS' : '❌ no'}`);
    }
    
    // Set the CORRECT password (temp839637)
    console.log('\n🔧 Setting password to: temp839637');
    const hashedPassword = await bcrypt.hash('temp839637', 12);
    
    await prisma.user.update({
      where: { id: jenny.id },
      data: {
        password: hashedPassword,
        studioName: 'Universal Beauty Studio Academy',
        businessName: 'Universal Beauty Studio - Tyrone Jackson'
      }
    });
    
    console.log('✅ Password set to: temp839637');
    console.log('✅ Studio names updated');
    console.log('\n📋 JENNY LOGIN CREDENTIALS:');
    console.log('   Email: jenny@universalbeautystudio.com');
    console.log('   Password: temp839637');
    console.log('   User ID:', jenny.id);
    console.log('\n📋 USE THIS ID FOR SERVICE ASSIGNMENTS:');
    console.log(`   Jenny Database ID: ${jenny.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findBothJennyAccounts();

