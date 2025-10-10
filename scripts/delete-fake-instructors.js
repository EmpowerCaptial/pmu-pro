const { PrismaClient } = require('@prisma/client');

// Use production database
const prodDbUrl = "postgres://5890c2e407a85b65bf7dc0b6b8713ba23b23197329c65c44bcd9b99cbf6b1db3:sk_tY0xAe_zsUcKhA6HPxSz2@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: { url: prodDbUrl }
  }
});

async function deleteFakeInstructors() {
  try {
    console.log('🔍 Finding fake/test instructor accounts in PRODUCTION...\n');
    
    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    console.log(`Found ${users.length} total users:\n`);
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) - ${u.role}`);
    });
    
    // Find fake/test accounts
    const fakePatterns = [
      'sarah johnson',
      'test frontend',
      'working test',
      'test-instructor',
      'michael chen',
      'emma rodriguez'
    ];
    
    const fakeUsers = users.filter(u => 
      fakePatterns.some(pattern => 
        u.name?.toLowerCase().includes(pattern) || 
        u.email?.toLowerCase().includes(pattern)
      )
    );
    
    if (fakeUsers.length === 0) {
      console.log('\n✅ No fake instructors found in database!');
      console.log('   The fake data must be in localStorage only.');
      return;
    }
    
    console.log(`\n⚠️ Found ${fakeUsers.length} fake accounts to delete:`);
    fakeUsers.forEach(u => {
      console.log(`   - ${u.name} (${u.email})`);
    });
    
    console.log('\n🗑️ Deleting fake accounts...');
    for (const user of fakeUsers) {
      await prisma.user.delete({
        where: { id: user.id }
      });
      console.log(`   ✅ Deleted: ${user.name}`);
    }
    
    console.log('\n🎉 All fake instructors deleted from production database!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteFakeInstructors();

