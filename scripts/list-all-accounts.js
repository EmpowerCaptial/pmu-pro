const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAllAccounts() {
  try {
    console.log('📊 COMPLETE ACCOUNT INVENTORY\n');
    console.log('='.repeat(70));
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        businessName: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        _count: {
          select: {
            services: true
          }
        }
      },
      orderBy: {
        role: 'asc'
      }
    });
    
    console.log(`\n📋 DATABASE ACCOUNTS (${users.length} total):\n`);
    
    // Group by role
    const owners = users.filter(u => u.role === 'owner');
    const instructors = users.filter(u => u.role === 'instructor');
    const licensed = users.filter(u => u.role === 'licensed');
    const students = users.filter(u => u.role === 'student');
    const others = users.filter(u => !['owner', 'instructor', 'licensed', 'student'].includes(u.role));
    
    if (owners.length > 0) {
      console.log('👑 OWNERS:');
      for (const user of owners) {
        console.log(`   📧 ${user.email}`);
        console.log(`      Name: ${user.name || 'NOT SET'}`);
        console.log(`      ID: ${user.id}`);
        console.log(`      Studio Name: ${user.studioName || '❌ NOT SET'}`);
        console.log(`      Business Name: ${user.businessName || '❌ NOT SET'}`);
        console.log(`      Plan: ${user.selectedPlan || 'none'}`);
        console.log(`      Subscription: ${user.hasActiveSubscription ? '✅ Active' : '❌ Inactive'}`);
        console.log(`      Services: ${user._count.services}`);
        
        if (user._count.services > 0) {
          const services = await prisma.service.findMany({
            where: { userId: user.id },
            select: { name: true, isActive: true }
          });
          console.log(`      Service List:`);
          services.forEach(s => {
            console.log(`         - ${s.name} ${s.isActive ? '(Active)' : '(Inactive)'}`);
          });
        }
        console.log('');
      }
    }
    
    if (instructors.length > 0) {
      console.log('\n🎓 INSTRUCTORS:');
      instructors.forEach(u => {
        console.log(`   - ${u.name} (${u.email})`);
        console.log(`     ID: ${u.id}, Studio: ${u.studioName || 'NOT SET'}`);
      });
    }
    
    if (licensed.length > 0) {
      console.log('\n✅ LICENSED ARTISTS:');
      licensed.forEach(u => {
        console.log(`   - ${u.name} (${u.email})`);
        console.log(`     ID: ${u.id}, Studio: ${u.studioName || 'NOT SET'}`);
      });
    }
    
    if (students.length > 0) {
      console.log('\n🎓 STUDENTS:');
      students.forEach(u => {
        console.log(`   - ${u.name} (${u.email})`);
        console.log(`     ID: ${u.id}, Studio: ${u.studioName || 'NOT SET'}`);
      });
    }
    
    if (others.length > 0) {
      console.log('\n❓ OTHER ROLES:');
      others.forEach(u => {
        console.log(`   - ${u.name} (${u.email}) - Role: ${u.role}`);
      });
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n📋 BROWSER LOCALSTORAGE CHECK');
    console.log('='.repeat(70));
    console.log('\nRun this in BROWSER CONSOLE to check localStorage:\n');
    console.log('---START COPY---\n');
    console.log(`
console.log('📦 LOCALSTORAGE DATA:\\n');

// Current user
const demoUser = localStorage.getItem('demoUser');
if (demoUser) {
  const user = JSON.parse(demoUser);
  console.log('Current Logged In User:');
  console.log('  Name:', user.name);
  console.log('  Email:', user.email);
  console.log('  ID:', user.id);
  console.log('  Role:', user.role);
  console.log('  Studio Name:', user.studioName || 'NOT SET');
  console.log('  Business Name:', user.businessName || 'NOT SET');
}

// Team members
const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]');
console.log('\\nTeam Members (${teamMembers.length}):');
teamMembers.forEach((m, i) => {
  console.log(\`  \${i + 1}. \${m.name} (\${m.email}) - \${m.role}\`);
  console.log(\`     ID: \${m.id}\`);
  console.log(\`     Studio: \${m.studioName || 'NOT SET'}\`);
});

// Instructors
const instructors = JSON.parse(localStorage.getItem('studio-instructors') || '[]');
console.log('\\nStudio Instructors (${instructors.length}):');
instructors.forEach((i, idx) => {
  console.log(\`  \${idx + 1}. \${i.name} (\${i.email})\`);
});

// Service assignments
const assignments = JSON.parse(localStorage.getItem('service-assignments') || '[]');
const activeAssignments = assignments.filter(a => a.assigned);
console.log('\\nService Assignments (${activeAssignments.length} active):');
const byUser = {};
activeAssignments.forEach(a => {
  if (!byUser[a.userId]) byUser[a.userId] = 0;
  byUser[a.userId]++;
});
Object.keys(byUser).forEach(userId => {
  const member = teamMembers.find(m => m.id === userId);
  console.log(\`  \${member?.name || userId}: \${byUser[userId]} services\`);
});
    `);
    console.log('\n---END COPY---\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listAllAccounts();

