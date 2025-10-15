const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function monitorStorage() {
  console.log('📊 PMU GUIDE STORAGE MONITOR\n');
  console.log('=' .repeat(50) + '\n');
  
  // Count resources
  const users = await prisma.user.count();
  const clients = await prisma.client.count();
  const appointments = await prisma.appointment.count();
  const services = await prisma.service.count();
  const usersWithAvatars = await prisma.user.count({ where: { avatar: { not: null } } });
  const servicesWithImages = await prisma.service.count({ where: { imageUrl: { not: null } } });
  
  // Sample sizes
  const sampleUser = await prisma.user.findFirst({
    where: { avatar: { not: null } },
    select: { avatar: true }
  });
  
  const avgImageSize = sampleUser?.avatar ? sampleUser.avatar.length / 1024 : 0;
  const totalImageSize = ((usersWithAvatars + servicesWithImages) * avgImageSize) / 1024;
  
  console.log('📈 USER METRICS:');
  console.log('   Total Users:', users);
  console.log('   Total Clients:', clients);
  console.log('   Total Appointments:', appointments);
  console.log('   Total Services:', services);
  console.log('');
  
  console.log('📸 IMAGE STORAGE:');
  console.log('   Profile Photos:', usersWithAvatars);
  console.log('   Service Images:', servicesWithImages);
  console.log('   Total Images:', usersWithAvatars + servicesWithImages);
  console.log('   Estimated Size:', totalImageSize.toFixed(2), 'MB');
  console.log('');
  
  console.log('🎯 SCALE ASSESSMENT:');
  console.log('');
  
  // Determine current phase
  if (users < 50) {
    console.log('   Phase: 🟢 STARTUP (0-50 users)');
    console.log('   Status: All systems optimal');
    console.log('   Action: No upgrades needed');
    console.log('   Cost: $0/month');
  } else if (users < 100) {
    console.log('   Phase: 🟡 GROWTH (50-100 users)');
    console.log('   Status: Monitor closely');
    console.log('   Action: Prepare for Neon upgrade');
    console.log('   Cost: $0-39/month');
  } else if (users < 250) {
    console.log('   Phase: 🟠 SCALING (100-250 users)');
    console.log('   Status: Upgrade recommended');
    console.log('   Action: Neon Scale + consider Blob migration');
    console.log('   Cost: $39-60/month');
  } else {
    console.log('   Phase: 🔴 ENTERPRISE (250+ users)');
    console.log('   Status: Production infrastructure required');
    console.log('   Action: Full migration to Blob + Neon Pro');
    console.log('   Cost: $100-150/month');
  }
  
  console.log('');
  console.log('⚠️  UPGRADE TRIGGERS:');
  
  const warnings = [];
  
  if (totalImageSize > 400) warnings.push('   🚨 Database images > 400 MB - MIGRATE TO BLOB NOW');
  if (users > 100) warnings.push('   ⚠️  Users > 100 - Consider Neon Scale plan');
  if (users > 250) warnings.push('   🚨 Users > 250 - Upgrade to production infrastructure');
  if (totalImageSize > 200) warnings.push('   ⚠️  Image storage > 200 MB - Plan Blob migration');
  
  if (warnings.length > 0) {
    warnings.forEach(w => console.log(w));
  } else {
    console.log('   ✅ No immediate actions required');
  }
  
  console.log('');
  console.log('📅 NEXT REVIEW:');
  if (users < 50) {
    console.log('   Check again at 50 users or in 3 months');
  } else if (users < 100) {
    console.log('   Check weekly');
  } else {
    console.log('   Check daily');
  }
  
  console.log('');
  console.log('💰 PROJECTED MONTHLY COSTS:');
  
  if (users < 100) {
    console.log('   Current: $0/month');
    console.log('   Next phase (100 users): $39/month');
  } else if (users < 250) {
    console.log('   Current: ~$39/month');
    console.log('   Next phase (250 users): ~$104/month');
  } else {
    console.log('   Current: ~$104-134/month');
    console.log('   Revenue (est): $' + (users * 49).toLocaleString() + '/month');
    console.log('   Profit margin: ' + (((users * 49 - 134) / (users * 49)) * 100).toFixed(1) + '%');
  }
  
  await prisma.$disconnect();
}

monitorStorage().catch(console.error);

