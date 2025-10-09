const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function completeSetup() {
  try {
    console.log('🔧 Completing Jenny + Tyrone setup...\n');
    
    const tyrone = await prisma.user.findUnique({
      where: { email: 'tyronejackboy@gmail.com' }
    });
    
    const jenny = await prisma.user.findUnique({
      where: { email: 'jenny@universalbeautystudio.com' }
    });
    
    const services = await prisma.service.findMany({
      where: { userId: tyrone.id },
      select: { id: true, name: true }
    });
    
    console.log('✅ Tyrone ID:', tyrone.id);
    console.log('✅ Jenny ID:', jenny.id);
    console.log('✅ Services:', services.length);
    
    console.log('\n📊 SETUP COMPLETE!');
    console.log('\n🔧 NOW RUN THIS IN BROWSER CONSOLE (as owner):');
    console.log('\n--- COPY FROM HERE ---\n');
    
    console.log(`
// Link Jenny's team member to her database account
const jennyId = '${jenny.id}';
const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]');
const jennyIndex = teamMembers.findIndex(m => m.email === 'jenny@universalbeautystudio.com');

if (jennyIndex >= 0) {
  teamMembers[jennyIndex].id = jennyId;
  localStorage.setItem('studio-team-members', JSON.stringify(teamMembers));
  console.log('✅ Updated Jenny in team members');
} else {
  // Add Jenny to team members
  teamMembers.push({
    id: jennyId,
    name: 'Jenny Smith',
    email: 'jenny@universalbeautystudio.com',
    role: 'student',
    status: 'active',
    invitedAt: new Date().toISOString(),
    joinedAt: new Date().toISOString()
  });
  localStorage.setItem('studio-team-members', JSON.stringify(teamMembers));
  console.log('✅ Added Jenny to team members');
}

// Assign services to Jenny
const serviceIds = ${JSON.stringify(services.map(s => s.id))};
const assignments = [];

serviceIds.forEach(serviceId => {
  assignments.push({
    serviceId: serviceId,
    userId: jennyId,
    assigned: true
  });
});

localStorage.setItem('service-assignments', JSON.stringify(assignments));
console.log('✅ Assigned', assignments.length, 'services to Jenny');

alert('✅ Setup complete! Jenny can now log in and book supervision with these services: ${services.map(s => s.name).join(', ')}');
    `);
    
    console.log('\n--- END COPY ---');
    
    console.log('\n📝 Then Jenny can login with:');
    console.log('   Email: jenny@universalbeautystudio.com');
    console.log('   Password: jennyabshire');
    console.log('\n   And book Lip Blush supervision on Oct 24 at 9:30 AM! ✅');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

completeSetup();

