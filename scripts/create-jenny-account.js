const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createJennyAccount() {
  try {
    console.log('🔧 Creating Jenny\'s database account...\n');
    
    // Check if Jenny already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'jenny@universalbeautystudio.com' }
    });
    
    if (existing) {
      console.log('✅ Jenny already exists!');
      console.log('   ID:', existing.id);
      console.log('   Name:', existing.name);
      console.log('   Email:', existing.email);
      console.log('\n📋 Use this ID to fix assignments:', existing.id);
      return;
    }
    
    // Create Jenny's account
    const password = 'JennyStudent123!'; // Temporary password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const jenny = await prisma.user.create({
      data: {
        email: 'jenny@universalbeautystudio.com',
        name: 'Jenny Smith',
        password: hashedPassword,
        role: 'student',
        selectedPlan: 'studio',
        hasActiveSubscription: true,
        isLicenseVerified: false,
        businessName: 'Universal Beauty Studio Academy',
        studioName: 'Universal Beauty Studio Academy',
        licenseNumber: '',
        licenseState: ''
      }
    });
    
    console.log('✅ Jenny\'s account created successfully!');
    console.log('   ID:', jenny.id);
    console.log('   Email:', jenny.email);
    console.log('   Temporary Password:', password);
    console.log('\n⚠️  IMPORTANT: Give Jenny this password to log in:');
    console.log('   Password: ' + password);
    console.log('   (She should change it after first login)');
    console.log('');
    console.log('📋 Now fix the service assignments with this browser console code:');
    console.log('');
    console.log('---COPY THIS AND RUN IN BROWSER CONSOLE (as owner)---');
    console.log(`
const jennyDatabaseId = '${jenny.id}';
const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]');
const jennyIndex = teamMembers.findIndex(m => m.email === 'jenny@universalbeautystudio.com');

if (jennyIndex >= 0) {
  const oldId = teamMembers[jennyIndex].id;
  console.log('🔄 Updating Jenny\\'s ID:');
  console.log('   Old ID:', oldId);
  console.log('   New ID:', jennyDatabaseId);
  
  teamMembers[jennyIndex].id = jennyDatabaseId;
  localStorage.setItem('studio-team-members', JSON.stringify(teamMembers));
  
  const assignments = JSON.parse(localStorage.getItem('service-assignments') || '[]');
  const updated = assignments.map(a => 
    a.userId === oldId ? {...a, userId: jennyDatabaseId} : a
  );
  localStorage.setItem('service-assignments', JSON.stringify(updated));
  
  const count = updated.filter(a => a.userId === jennyDatabaseId && a.assigned).length;
  alert('✅ FIXED! Jenny now has ' + count + ' services. She can log in with email: jenny@universalbeautystudio.com and password: ${password}');
} else {
  alert('❌ Jenny not in team members yet - add her first');
}
    `);
    console.log('---END COPY---');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createJennyAccount();

