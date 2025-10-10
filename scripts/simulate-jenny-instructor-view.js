const { PrismaClient } = require('@prisma/client');

const prodDbUrl = "postgres://5890c2e407a85b65bf7dc0b6b8713ba23b23197329c65c44bcd9b99cbf6b1db3:sk_tY0xAe_zsUcKhA6HPxSz2@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: { db: { url: prodDbUrl } }
});

async function simulateJennyView() {
  try {
    console.log('🧪 SIMULATING JENNY\'S VIEW IN SUPERVISION BOOKING\n');
    console.log('='.repeat(70));
    
    // Step 1: Jenny logs in
    console.log('\n👤 Step 1: Jenny Abshire logs in...');
    const jenny = await prisma.user.findUnique({
      where: { email: 'jenny@universalbeautystudio.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true
      }
    });
    
    if (!jenny) {
      console.log('❌ Jenny not found!');
      return;
    }
    
    console.log('   ✅ Logged in as:', jenny.name);
    console.log('   Role:', jenny.role);
    console.log('   Studio:', jenny.studioName);
    
    // Step 2: Jenny goes to /studio/supervision
    console.log('\n📱 Step 2: Jenny navigates to Supervision Booking...');
    console.log('   URL: /studio/supervision');
    
    // Step 3: Page calls /api/studio/team-members
    console.log('\n🌐 Step 3: Page calls API: /api/studio/team-members');
    console.log('   Headers: { x-user-email: "jenny@universalbeautystudio.com" }');
    
    // Simulate the API call
    const teamMembers = await prisma.user.findMany({
      where: {
        studioName: jenny.studioName
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
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' }
      ]
    });
    
    console.log(`   ✅ API returned ${teamMembers.length} team members`);
    
    // Step 4: Filter for instructors (like the page does)
    console.log('\n👨‍🏫 Step 4: Filtering for instructors...');
    const instructors = teamMembers.filter(m => 
      (m.role === 'instructor' || m.role === 'licensed' || m.role === 'owner') &&
      m.email !== jenny.email // Exclude Jenny herself
    );
    
    console.log(`   Found ${instructors.length} instructors\n`);
    
    // Step 5: Display instructor list (what Jenny sees)
    console.log('='.repeat(70));
    console.log('\n📋 JENNY SEES THIS INSTRUCTOR LIST:\n');
    
    instructors.forEach((instructor, index) => {
      const isMya = instructor.email.includes('myap');
      const icon = isMya ? '🆕' : '👨‍🏫';
      
      console.log(`${icon} ${index + 1}. ${instructor.name}`);
      console.log(`   Email: ${instructor.email}`);
      console.log(`   Role: ${instructor.role}`);
      console.log(`   Studio: ${instructor.studioName}`);
      
      if (isMya) {
        console.log('   ⭐ NEWLY ADDED INSTRUCTOR! ⭐');
      }
      
      console.log('');
    });
    
    // Step 6: Verification
    console.log('='.repeat(70));
    console.log('\n✅ VERIFICATION:\n');
    
    const myaInList = instructors.some(i => i.email.includes('myap'));
    const allyInList = instructors.some(i => i.email.includes('ally'));
    const tierraInList = instructors.some(i => i.email.includes('tierra'));
    const tyroneInList = instructors.some(i => i.email.includes('Tyronejackboy'));
    
    console.log(`   ✅ Mya Pettersen visible: ${myaInList ? 'YES ✅' : 'NO ❌'}`);
    console.log(`   ✅ Ally Webb visible: ${allyInList ? 'YES ✅' : 'NO ❌'}`);
    console.log(`   ✅ Tierra Cochrane visible: ${tierraInList ? 'YES ✅' : 'NO ❌'}`);
    console.log(`   ✅ Tyrone Jackson visible: ${tyroneInList ? 'YES ✅' : 'NO ❌'}`);
    
    console.log(`\n   Total instructors available: ${instructors.length}`);
    
    if (myaInList) {
      console.log('\n🎉 SUCCESS! Jenny can now book with Mya Pettersen!');
    } else {
      console.log('\n⚠️ WARNING! Mya is not visible to Jenny.');
    }
    
    // Step 7: What Jenny can do next
    console.log('\n📱 NEXT STEPS FOR JENNY:\n');
    console.log('   1. Select an instructor (e.g., Mya Pettersen)');
    console.log('   2. Choose a date');
    console.log('   3. Select a time slot');
    console.log('   4. Pick a service (Lip Blush, Microblading, etc.)');
    console.log('   5. Enter client information');
    console.log('   6. Complete booking');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

simulateJennyView();

