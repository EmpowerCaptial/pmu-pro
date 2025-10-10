const { PrismaClient } = require('@prisma/client');

const prodDbUrl = "postgres://5890c2e407a85b65bf7dc0b6b8713ba23b23197329c65c44bcd9b99cbf6b1db3:sk_tY0xAe_zsUcKhA6HPxSz2@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: { db: { url: prodDbUrl } }
});

async function cleanup() {
  try {
    console.log('🧹 CLEANING PRODUCTION DATABASE...\n');
    
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    });
    
    console.log(`Found ${users.length} total users\n`);
    
    // Delete patterns
    const deletePatterns = [
      'deleted_',
      'test-',
      '-test-',
      'debug-test',
      'final-test',
      'delay-test',
      'jenny-fixed',
      'jenny-final',
      'jenny-debug',
      'verification-test',
      'student-supervision',
      'test-services-fix'
    ];
    
    const toDelete = users.filter(u => 
      deletePatterns.some(pattern => 
        u.email.toLowerCase().includes(pattern) ||
        u.name?.toLowerCase().includes(pattern)
      )
    );
    
    console.log(`🗑️ Deleting ${toDelete.length} test/debug accounts:\n`);
    
    for (const user of toDelete) {
      console.log(`   Deleting: ${user.name} (${user.email})`);
      await prisma.user.delete({ where: { id: user.id } });
    }
    
    console.log(`\n✅ Deleted ${toDelete.length} test accounts`);
    
    // Fix duplicate Tyrone accounts
    const tyrones = users.filter(u => u.email.toLowerCase().includes('tyronejackboy'));
    if (tyrones.length > 1) {
      console.log(`\n⚠️ Found ${tyrones.length} Tyrone accounts:`);
      tyrones.forEach(t => console.log(`   - ${t.name} (${t.email}) - ID: ${t.id}`));
      console.log('\n   Keeping the one with services, deleting others...');
      
      // Find which has services
      for (const tyrone of tyrones) {
        const serviceCount = await prisma.service.count({
          where: { userId: tyrone.id }
        });
        console.log(`   ${tyrone.email}: ${serviceCount} services`);
        
        if (serviceCount === 0) {
          console.log(`   🗑️ Deleting duplicate with no services`);
          await prisma.user.delete({ where: { id: tyrone.id } });
        }
      }
    }
    
    // Fix duplicate Tierra accounts
    const tierras = users.filter(u => u.email.toLowerCase().includes('tierra'));
    if (tierras.length > 1) {
      console.log(`\n⚠️ Found ${tierras.length} Tierra accounts:`);
      tierras.forEach(t => console.log(`   - ${t.name} (${t.email})`));
      
      // Keep only tierra.cochrane51@gmail.com
      for (const tierra of tierras) {
        if (tierra.email !== 'tierra.cochrane51@gmail.com') {
          console.log(`   🗑️ Deleting duplicate: ${tierra.email}`);
          await prisma.user.delete({ where: { id: tierra.id } });
        }
      }
    }
    
    // Final count
    const remaining = await prisma.user.count();
    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Remaining users: ${remaining}`);
    console.log('\n📋 Remaining users should be:');
    
    const final = await prisma.user.findMany({
      select: { name: true, email: true, role: true }
    });
    
    final.forEach(u => {
      console.log(`   - ${u.name} (${u.email}) - ${u.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();

