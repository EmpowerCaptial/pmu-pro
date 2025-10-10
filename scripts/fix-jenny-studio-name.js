const { PrismaClient } = require('@prisma/client');

const prodDbUrl = "postgres://5890c2e407a85b65bf7dc0b6b8713ba23b23197329c65c44bcd9b99cbf6b1db3:sk_tY0xAe_zsUcKhA6HPxSz2@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: { db: { url: prodDbUrl } }
});

async function fixJenny() {
  try {
    console.log('🔧 Fixing Jenny\'s studio name...\n');
    
    const jenny = await prisma.user.findUnique({
      where: { email: 'jenny@universalbeautystudio.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        businessName: true
      }
    });
    
    if (!jenny) {
      console.log('❌ Jenny not found');
      return;
    }
    
    console.log('Jenny current state:');
    console.log('   Studio Name:', jenny.studioName || '❌ NOT SET');
    console.log('   Business Name:', jenny.businessName || '❌ NOT SET');
    
    // Update Jenny
    await prisma.user.update({
      where: { id: jenny.id },
      data: {
        studioName: 'Universal Beauty Studio Academy',
        businessName: 'Universal Beauty Studio - Tyrone Jackson'
      }
    });
    
    console.log('\n✅ Updated Jenny:');
    console.log('   Studio Name: Universal Beauty Studio Academy');
    console.log('   Business Name: Universal Beauty Studio - Tyrone Jackson');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixJenny();

