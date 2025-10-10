const { PrismaClient } = require('@prisma/client');

const prodDbUrl = "postgres://5890c2e407a85b65bf7dc0b6b8713ba23b23197329c65c44bcd9b99cbf6b1db3:sk_tY0xAe_zsUcKhA6HPxSz2@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: { db: { url: prodDbUrl } }
});

async function fixTierra() {
  try {
    console.log('🔧 Checking Tierra\'s studio assignment...\n');
    
    const tierra = await prisma.user.findUnique({
      where: { email: 'tierra.cochrane51@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        businessName: true
      }
    });
    
    if (!tierra) {
      console.log('❌ Tierra not found!');
      return;
    }
    
    console.log('Tierra current state:');
    console.log('   Name:', tierra.name);
    console.log('   Email:', tierra.email);
    console.log('   Role:', tierra.role);
    console.log('   Studio Name:', tierra.studioName || '❌ NOT SET');
    console.log('   Business Name:', tierra.businessName || '❌ NOT SET');
    
    const tyrone = await prisma.user.findUnique({
      where: { email: 'Tyronejackboy@gmail.com' },
      select: { studioName: true, businessName: true }
    });
    
    console.log('\nTyrone (owner) studio:');
    console.log('   Studio Name:', tyrone?.studioName);
    console.log('   Business Name:', tyrone?.businessName);
    
    if (tierra.studioName !== tyrone?.studioName) {
      console.log('\n⚠️ MISMATCH! Tierra is in wrong studio!');
      console.log('   Fixing...');
      
      await prisma.user.update({
        where: { id: tierra.id },
        data: {
          studioName: 'Universal Beauty Studio Academy',
          businessName: 'Universal Beauty Studio - Tyrone Jackson'
        }
      });
      
      console.log('\n✅ Updated Tierra:');
      console.log('   Studio Name: Universal Beauty Studio Academy');
      console.log('   Business Name: Universal Beauty Studio - Tyrone Jackson');
    } else {
      console.log('\n✅ Tierra is already in the correct studio!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixTierra();

