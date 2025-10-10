const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('🔍 Checking for service_assignments table...\n');
    
    // Try to query the table
    const count = await prisma.serviceAssignment.count();
    
    console.log('✅ SUCCESS! Table exists in this database');
    console.log(`   Current assignments in database: ${count}`);
    
    if (count > 0) {
      const assignments = await prisma.serviceAssignment.findMany({
        take: 5,
        select: {
          id: true,
          serviceId: true,
          userId: true,
          assigned: true
        }
      });
      
      console.log('\n   Sample assignments:');
      assignments.forEach((a, i) => {
        console.log(`   ${i + 1}. Service: ${a.serviceId.slice(0, 15)}..., User: ${a.userId.slice(0, 15)}..., Assigned: ${a.assigned}`);
      });
    }
    
    // Check which users exist
    const users = await prisma.user.findMany({
      select: { email: true, name: true, role: true }
    });
    
    console.log(`\n✅ Found ${users.length} users in this database:`);
    users.forEach(u => {
      console.log(`   - ${u.email} (${u.name}) - ${u.role}`);
      if (u.email === 'Tyronejackboy@gmail.com') {
        console.log('     ⭐ THIS IS TYRONE - CORRECT DATABASE!');
      }
    });
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.log('❌ Table does NOT exist in this database');
      console.log('   Try the other Neon project');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

verify();

