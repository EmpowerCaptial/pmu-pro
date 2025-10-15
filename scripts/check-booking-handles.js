const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStudioMembers() {
  console.log('=== CHECKING BOOKING HANDLE CONFLICTS ===\n');
  
  const studioName = 'Universal Beauty Studio Academy';
  
  const members = await prisma.user.findMany({
    where: {
      studioName: studioName
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      studioName: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
  
  console.log('Studio Name:', studioName);
  console.log('Members Found:', members.length);
  console.log('');
  
  // Show what handle would be generated
  const handle = studioName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  console.log('🔗 Shared Booking Handle:', handle);
  console.log('Link: https://thepmuguide.com/book/' + handle);
  console.log('');
  console.log('⚠️  PROBLEM: All members share the SAME link!');
  console.log('');
  
  members.forEach((member, index) => {
    console.log(`${index + 1}. ${member.name} (${member.role})`);
    console.log(`   Email: ${member.email}`);
    console.log(`   Studio Handle: ${handle} ← SAME FOR ALL!`);
    
    // Show individual email handle
    const emailHandle = member.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
    console.log(`   Email Handle: ${emailHandle} (unique)`);
    console.log('');
  });
  
  console.log('❌ Current API behavior:');
  console.log('   - Client visits: /book/' + handle);
  console.log('   - API searches all users for matching handle');
  console.log('   - Returns FIRST match found: ' + members[0].name);
  console.log('   - Other members (Ally, Tierra, Jenny) are IGNORED');
  console.log('');
  
  console.log('🔧 Solutions:');
  console.log('   1. Use individual email handles for team members');
  console.log('      - Ally: /book/' + members.find(m => m.name.includes('Ally'))?.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-'));
  console.log('   2. Create unified studio page (owner shows all services)');
  console.log('   3. Add unique artist slugs to profiles');
  
  await prisma.$disconnect();
}

checkStudioMembers().catch(console.error);

