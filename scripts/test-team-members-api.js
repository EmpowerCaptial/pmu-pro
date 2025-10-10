const { PrismaClient } = require('@prisma/client');

const prodDbUrl = "postgres://5890c2e407a85b65bf7dc0b6b8713ba23b23197329c65c44bcd9b99cbf6b1db3:sk_tY0xAe_zsUcKhA6HPxSz2@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: { db: { url: prodDbUrl } }
});

async function testAPI() {
  try {
    console.log('🔍 SIMULATING /api/studio/team-members FOR JENNY\n');
    console.log('='.repeat(70));
    
    // Find Jenny
    const jenny = await prisma.user.findUnique({
      where: { email: 'jenny@universalbeautystudio.com' },
      select: {
        id: true,
        name: true,
        email: true,
        studioName: true
      }
    });
    
    if (!jenny) {
      console.log('❌ Jenny not found!');
      return;
    }
    
    console.log('\n👤 Jenny Account:');
    console.log('   Email:', jenny.email);
    console.log('   Studio:', jenny.studioName || '⚠️ NOT SET');
    
    // Get team members (what the API would return)
    const teamMembers = await prisma.user.findMany({
      where: {
        studioName: jenny.studioName,
        role: { in: ['owner', 'instructor', 'licensed', 'student'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        specialties: true,
        certifications: true,
        bio: true,
        phone: true,
        businessName: true,
        studioName: true
      }
    });
    
    console.log('\n📋 Team Members API Would Return:');
    console.log(`   Total: ${teamMembers.length} members\n`);
    
    teamMembers.forEach(member => {
      console.log(`   ${member.name} (${member.email})`);
      console.log(`      Role: ${member.role}`);
      console.log(`      Studio: ${member.studioName || 'NOT SET'}`);
      console.log('');
    });
    
    // Filter for instructors
    const instructors = teamMembers.filter(m => 
      (m.role === 'instructor' || m.role === 'licensed' || m.role === 'owner')
    );
    
    console.log('='.repeat(70));
    console.log(`\n👨‍🏫 INSTRUCTORS JENNY SHOULD SEE: ${instructors.length}`);
    instructors.forEach(i => {
      console.log(`   ✅ ${i.name} (${i.email}) - ${i.role}`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('\n🎯 EXPECTED: 2 instructors (Tyrone + Tierra)');
    console.log(`   ACTUAL: ${instructors.length} instructors`);
    
    if (instructors.length !== 2) {
      console.log('\n⚠️ MISMATCH! Should be exactly 2.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();

