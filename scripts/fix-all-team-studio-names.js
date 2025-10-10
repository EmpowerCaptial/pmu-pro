const { PrismaClient } = require('@prisma/client');

const prodDbUrl = "postgres://5890c2e407a85b65bf7dc0b6b8713ba23b23197329c65c44bcd9b99cbf6b1db3:sk_tY0xAe_zsUcKhA6HPxSz2@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: { db: { url: prodDbUrl } }
});

async function fixAllTeamStudioNames() {
  try {
    console.log('🔧 FIXING ALL TEAM MEMBER STUDIO NAMES\n');
    
    // Get owner's correct info
    const owner = await prisma.user.findUnique({
      where: { email: 'Tyronejackboy@gmail.com' },
      select: {
        studioName: true,
        businessName: true
      }
    });
    
    if (!owner) {
      console.log('❌ Owner not found!');
      return;
    }
    
    console.log('✅ Owner\'s correct studio info:');
    console.log('   Studio Name:', owner.studioName);
    console.log('   Business Name:', owner.businessName);
    
    // Find all team members with wrong studio name
    const wrongStudioMembers = await prisma.user.findMany({
      where: {
        email: { contains: '@universalbeautystudio.com' },
        NOT: {
          studioName: owner.studioName
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        studioName: true
      }
    });
    
    if (wrongStudioMembers.length === 0) {
      console.log('\n✅ All team members already have correct studio names!');
      return;
    }
    
    console.log(`\n⚠️ Found ${wrongStudioMembers.length} team members with wrong studio names:\n`);
    
    for (const member of wrongStudioMembers) {
      console.log(`   Fixing: ${member.name}`);
      console.log(`      Old Studio: ${member.studioName}`);
      
      await prisma.user.update({
        where: { id: member.id },
        data: {
          studioName: owner.studioName,
          businessName: owner.businessName
        }
      });
      
      console.log(`      New Studio: ${owner.studioName}`);
      console.log(`      ✅ Fixed!\n`);
    }
    
    console.log('🎉 All team members now have the correct studio name!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllTeamStudioNames();

