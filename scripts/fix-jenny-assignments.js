const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixJennyAssignments() {
  try {
    console.log('🔍 Finding Jenny in database...\n');
    
    // Find Jenny's database user
    const jenny = await prisma.user.findUnique({
      where: { email: 'jenny@universalbeautystudio.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    if (!jenny) {
      console.log('❌ Jenny not found in database!');
      console.log('   Please create her account first.');
      return;
    }
    
    console.log('✅ Found Jenny in database:');
    console.log('   Name:', jenny.name);
    console.log('   Email:', jenny.email);
    console.log('   Role:', jenny.role);
    console.log('   Database User ID:', jenny.id);
    console.log('');
    
    console.log('📋 COPY THIS ID AND USE IT TO FIX ASSIGNMENTS:');
    console.log('');
    console.log('   Jenny\'s Database ID: ' + jenny.id);
    console.log('');
    console.log('🔧 Now run this in browser console while logged in as OWNER:');
    console.log('');
    console.log('---START COPY FROM HERE---');
    console.log(`
const jennyDatabaseId = '${jenny.id}';
const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]');
const jennyIndex = teamMembers.findIndex(m => m.email === 'jenny@universalbeautystudio.com');

if (jennyIndex >= 0) {
  const oldId = teamMembers[jennyIndex].id;
  console.log('Old team member ID:', oldId);
  console.log('New database ID:', jennyDatabaseId);
  
  // Update team member ID
  teamMembers[jennyIndex].id = jennyDatabaseId;
  localStorage.setItem('studio-team-members', JSON.stringify(teamMembers));
  console.log('✅ Updated team member ID');
  
  // Update service assignments
  const assignments = JSON.parse(localStorage.getItem('service-assignments') || '[]');
  const updated = assignments.map(a => 
    a.userId === oldId ? {...a, userId: jennyDatabaseId} : a
  );
  localStorage.setItem('service-assignments', JSON.stringify(updated));
  
  const jennyServices = updated.filter(a => a.userId === jennyDatabaseId && a.assigned);
  console.log('✅ Fixed! Jenny now has', jennyServices.length, 'services assigned');
  alert('✅ FIXED! Jenny now has ' + jennyServices.length + ' services assigned. Have her refresh and try again.');
} else {
  console.log('❌ Jenny not found in team members');
  alert('Jenny not found in team members. Please add her first.');
}
    `);
    console.log('---END COPY---');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixJennyAssignments();

