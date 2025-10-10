const { PrismaClient } = require('@prisma/client');

const prodDbUrl = "postgres://5890c2e407a85b65bf7dc0b6b8713ba23b23197329c65c44bcd9b99cbf6b1db3:sk_tY0xAe_zsUcKhA6HPxSz2@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: { db: { url: prodDbUrl } }
});

async function checkFinal() {
  try {
    console.log('📊 FINAL PRODUCTION STATE\n');
    console.log('='.repeat(70));
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        _count: { select: { services: true } }
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' }
      ]
    });
    
    console.log(`\n✅ Total Users: ${users.length}\n`);
    
    // Group by role
    const owners = users.filter(u => u.role === 'owner');
    const instructors = users.filter(u => u.role === 'instructor');
    const licensed = users.filter(u => u.role === 'licensed');
    const students = users.filter(u => u.role === 'student');
    
    if (owners.length > 0) {
      console.log('👑 OWNERS:');
      for (const u of owners) {
        console.log(`   ${u.name} (${u.email})`);
        console.log(`      Services: ${u._count.services}`);
        console.log(`      Studio: ${u.studioName || 'NOT SET'}`);
        console.log('');
      }
    }
    
    if (instructors.length > 0) {
      console.log('\n🎓 INSTRUCTORS:');
      instructors.forEach(u => {
        console.log(`   ${u.name} (${u.email})`);
        console.log(`      Studio: ${u.studioName || 'NOT SET'}`);
      });
    }
    
    if (students.length > 0) {
      console.log(`\n👨‍🎓 STUDENTS: ${students.length}`);
      students.forEach(u => {
        console.log(`   ${u.name} (${u.email})`);
      });
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n📋 CORRECT STATE SHOULD BE:');
    console.log('   1 Owner: Tyrone Jackson (with 7 services)');
    console.log('   1 Instructor: Tierra Cochrane');
    console.log('   1 Student: Jenny Abshire');
    console.log('   Total: 3 users');
    console.log('\n   Current: ' + users.length + ' users');
    
    if (users.length > 3) {
      console.log(`   ⚠️ ${users.length - 3} extra accounts need cleanup`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkFinal();

