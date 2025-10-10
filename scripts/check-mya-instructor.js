const { PrismaClient } = require('@prisma/client');

const prodDbUrl = "postgres://5890c2e407a85b65bf7dc0b6b8713ba23b23197329c65c44bcd9b99cbf6b1db3:sk_tY0xAe_zsUcKhA6HPxSz2@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: { db: { url: prodDbUrl } }
});

async function checkMya() {
  try {
    console.log('🔍 Checking for Mya Pettersen...\n');
    
    // Search for Mya
    const mya = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: 'Mya', mode: 'insensitive' } },
          { name: { contains: 'Pettersen', mode: 'insensitive' } },
          { email: { contains: 'mya', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        businessName: true,
        createdAt: true
      }
    });
    
    if (!mya) {
      console.log('❌ Mya Pettersen not found in database!');
      console.log('\nPossible reasons:');
      console.log('   1. Account not created yet');
      console.log('   2. Name spelled differently');
      console.log('   3. Only exists in localStorage (not synced to database)');
      return;
    }
    
    console.log('✅ Found Mya Pettersen:');
    console.log('   Name:', mya.name);
    console.log('   Email:', mya.email);
    console.log('   Role:', mya.role);
    console.log('   Studio:', mya.studioName || '❌ NOT SET');
    console.log('   Business:', mya.businessName || '❌ NOT SET');
    console.log('   Created:', mya.createdAt);
    
    // Check if role is correct
    if (mya.role !== 'instructor' && mya.role !== 'licensed') {
      console.log('\n⚠️ WRONG ROLE!');
      console.log(`   Current: ${mya.role}`);
      console.log('   Should be: instructor or licensed');
      console.log('   Fix needed: Update role to "instructor"');
    }
    
    // Check if studio name matches Tyrone's
    const tyrone = await prisma.user.findUnique({
      where: { email: 'Tyronejackboy@gmail.com' },
      select: { studioName: true }
    });
    
    if (mya.studioName !== tyrone?.studioName) {
      console.log('\n⚠️ WRONG STUDIO!');
      console.log(`   Mya's studio: ${mya.studioName || 'NOT SET'}`);
      console.log(`   Tyrone's studio: ${tyrone?.studioName}`);
      console.log('   Fix needed: Update Mya\'s studioName to match Tyrone');
    }
    
    // Show all current instructors
    console.log('\n📋 All instructors in Universal Beauty Studio Academy:');
    const instructors = await prisma.user.findMany({
      where: {
        studioName: 'Universal Beauty Studio Academy',
        role: { in: ['instructor', 'licensed', 'owner'] }
      },
      select: {
        name: true,
        email: true,
        role: true
      }
    });
    
    instructors.forEach(i => {
      console.log(`   ${i.name} (${i.email}) - ${i.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkMya();

