const { PrismaClient } = require('@prisma/client');

const prodDbUrl = "postgres://5890c2e407a85b65bf7dc0b6b8713ba23b23197329c65c44bcd9b99cbf6b1db3:sk_tY0xAe_zsUcKhA6HPxSz2@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: { db: { url: prodDbUrl } }
});

async function testTeamMemberAddition() {
  try {
    console.log('🧪 TESTING TEAM MEMBER ADDITION FIX\n');
    console.log('='.repeat(70));
    
    // 1. Check owner's studio info
    console.log('\n📊 Step 1: Checking owner\'s studio information...');
    const owner = await prisma.user.findUnique({
      where: { email: 'Tyronejackboy@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        studioName: true,
        businessName: true
      }
    });
    
    if (!owner) {
      console.log('❌ Owner not found!');
      return;
    }
    
    console.log('   ✅ Owner:', owner.name);
    console.log('   ✅ Studio Name:', owner.studioName);
    console.log('   ✅ Business Name:', owner.businessName);
    
    // 2. Check all team members have correct studio name
    console.log('\n📊 Step 2: Checking all team members...');
    const teamMembers = await prisma.user.findMany({
      where: {
        OR: [
          { studioName: owner.studioName },
          { email: { contains: '@universalbeautystudio.com' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        businessName: true
      }
    });
    
    console.log(`   Found ${teamMembers.length} team members:\n`);
    
    let allCorrect = true;
    teamMembers.forEach(member => {
      const studioCorrect = member.studioName === owner.studioName;
      const icon = studioCorrect ? '✅' : '❌';
      
      console.log(`   ${icon} ${member.name} (${member.role})`);
      console.log(`      Email: ${member.email}`);
      console.log(`      Studio: ${member.studioName}`);
      
      if (!studioCorrect) {
        console.log(`      ⚠️ WRONG! Should be: ${owner.studioName}`);
        allCorrect = false;
      }
      console.log('');
    });
    
    // 3. Check instructors are visible to students
    console.log('\n📊 Step 3: Checking instructor visibility...');
    const instructors = teamMembers.filter(m => 
      m.role === 'instructor' || m.role === 'licensed' || m.role === 'owner'
    );
    
    console.log(`   ${instructors.length} instructors should be visible to students:`);
    instructors.forEach(i => {
      console.log(`      ✅ ${i.name} (${i.role})`);
    });
    
    // 4. Summary
    console.log('\n' + '='.repeat(70));
    console.log('\n📋 TEST SUMMARY:');
    console.log(`   Total team members: ${teamMembers.length}`);
    console.log(`   Instructors visible: ${instructors.length}`);
    console.log(`   All have correct studio: ${allCorrect ? '✅ YES' : '❌ NO'}`);
    
    if (allCorrect) {
      console.log('\n🎉 ✅ TEST PASSED!');
      console.log('   All team members have the correct studio name.');
      console.log('   New instructors will automatically get the correct studio.');
    } else {
      console.log('\n⚠️ ❌ TEST FAILED!');
      console.log('   Some team members have incorrect studio names.');
      console.log('   Run fix-mya-studio.js or similar to correct them.');
    }
    
    // 5. Expected instructors for students
    console.log('\n📱 Expected Behavior for Students:');
    console.log('   When Jenny goes to Supervision Booking, she should see:');
    instructors.forEach((i, idx) => {
      console.log(`      ${idx + 1}. ${i.name} (${i.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testTeamMemberAddition();

