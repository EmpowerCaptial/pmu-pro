const { PrismaClient } = require('@prisma/client');

const prodDbUrl = "postgres://5890c2e407a85b65bf7dc0b6b8713ba23b23197329c65c44bcd9b99cbf6b1db3:sk_tY0xAe_zsUcKhA6HPxSz2@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: { db: { url: prodDbUrl } }
});

async function fixMya() {
  try {
    console.log('🔧 Fixing Mya\'s studio assignment...\n');
    
    const mya = await prisma.user.findFirst({
      where: {
        email: { contains: 'myap@universalbeautystudio.com', mode: 'insensitive' }
      }
    });
    
    if (!mya) {
      console.log('❌ Mya not found!');
      return;
    }
    
    console.log('Before:');
    console.log('   Studio Name:', mya.studioName);
    console.log('   Business Name:', mya.businessName);
    
    // Update Mya's studio to match Tyrone's
    await prisma.user.update({
      where: { id: mya.id },
      data: {
        studioName: 'Universal Beauty Studio Academy',
        businessName: 'Universal Beauty Studio - Tyrone Jackson'
      }
    });
    
    console.log('\n✅ Updated Mya:');
    console.log('   Studio Name: Universal Beauty Studio Academy');
    console.log('   Business Name: Universal Beauty Studio - Tyrone Jackson');
    
    // Verify
    const updated = await prisma.user.findUnique({
      where: { id: mya.id },
      select: {
        name: true,
        email: true,
        role: true,
        studioName: true
      }
    });
    
    console.log('\n📋 Mya is now in the correct studio:');
    console.log('   Name:', updated?.name);
    console.log('   Email:', updated?.email);
    console.log('   Role:', updated?.role);
    console.log('   Studio:', updated?.studioName);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixMya();

