const { PrismaClient } = require('@prisma/client');

const prodDbUrl = "postgres://5890c2e407a85b65bf7dc0b6b8713ba23b23197329c65c44bcd9b99cbf6b1db3:sk_tY0xAe_zsUcKhA6HPxSz2@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: { db: { url: prodDbUrl } }
});

async function keepOnlyReal() {
  try {
    console.log('🧹 KEEPING ONLY REAL ACCOUNTS...\n');
    
    // KEEP THESE EMAILS ONLY:
    const keepEmails = [
      'Tyronejackboy@gmail.com',      // Owner with 7 services
      'tierra.cochrane51@gmail.com',   // Instructor
      'jenny@universalbeautystudio.com' // Student
    ];
    
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    });
    
    console.log(`Found ${users.length} total users\n`);
    console.log('✅ KEEPING:');
    keepEmails.forEach(email => console.log(`   - ${email}`));
    
    const toDelete = users.filter(u => !keepEmails.includes(u.email));
    
    console.log(`\n🗑️ DELETING ${toDelete.length} accounts:\n`);
    
    for (const user of toDelete) {
      console.log(`   Deleting: ${user.name} (${user.email})`);
      try {
        await prisma.user.delete({ where: { id: user.id } });
        console.log(`      ✅ Deleted`);
      } catch (error) {
        console.log(`      ⚠️ Already deleted or has dependencies`);
      }
    }
    
    console.log(`\n✅ Cleanup complete!`);
    
    const remaining = await prisma.user.findMany({
      select: { name: true, email: true, role: true, _count: { select: { services: true } } }
    });
    
    console.log(`\n📋 FINAL STATE (${remaining.length} users):\n`);
    remaining.forEach(u => {
      console.log(`   ${u.name} (${u.email}) - ${u.role}`);
      if (u._count.services > 0) {
        console.log(`      Services: ${u._count.services}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

keepOnlyReal();

