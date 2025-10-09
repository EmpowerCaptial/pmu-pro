const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteJenny() {
  try {
    console.log('🗑️  Deleting Jenny\'s account...\n');
    
    const jenny = await prisma.user.findUnique({
      where: { email: 'jenny@universalbeautystudio.com' }
    });
    
    if (!jenny) {
      console.log('✅ Jenny not found - already deleted or never existed');
      return;
    }
    
    console.log('Found Jenny:', jenny.id);
    console.log('Deleting...');
    
    await prisma.user.delete({
      where: { email: 'jenny@universalbeautystudio.com' }
    });
    
    console.log('✅ Jenny\'s database account deleted');
    console.log('\n📋 Now clean up localStorage (run in browser as owner):');
    console.log(`
// Remove Jenny from team members
const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]');
const filtered = teamMembers.filter(m => m.email !== 'jenny@universalbeautystudio.com');
localStorage.setItem('studio-team-members', JSON.stringify(filtered));

// Remove Jenny's assignments
const assignments = JSON.parse(localStorage.getItem('service-assignments') || '[]');
const filteredAssignments = assignments.filter(a => a.userId !== 'cmgjmqeac0000j4nxuggrutfw');
localStorage.setItem('service-assignments', JSON.stringify(filteredAssignments));

console.log('✅ Cleaned up localStorage');
alert('✅ Jenny completely removed. Now add her fresh through the UI!');
    `);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteJenny();

