const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeTyroneInstructor() {
  try {
    console.log('🔧 Adding instructor capabilities to Tyrone...\n');
    
    const tyrone = await prisma.user.update({
      where: { email: 'tyronejackboy@gmail.com' },
      data: {
        role: 'owner' // Keep as owner (owners can supervise too)
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true
      }
    });
    
    console.log('✅ Tyrone updated:', tyrone);
    console.log('\n📋 NOW RUN IN BROWSER CONSOLE (as Tyrone):');
    console.log(`
// Add Tyrone to instructor list for supervision
const tyroneAsInstructor = {
  id: '${tyrone.id}',
  name: '${tyrone.name}',
  email: '${tyrone.email}',
  role: 'instructor',
  specialty: 'Studio Owner & Master Instructor',
  experience: '10+ years',
  rating: 5.0,
  location: '${tyrone.studioName}',
  phone: '',
  avatar: null,
  licenseNumber: 'OWNER-001',
  availability: {
    monday: ['9:30 AM', '1:00 PM', '4:00 PM'],
    tuesday: ['9:30 AM', '1:00 PM', '4:00 PM'],
    wednesday: ['9:30 AM', '1:00 PM', '4:00 PM'],
    thursday: ['9:30 AM', '1:00 PM', '4:00 PM'],
    friday: ['9:30 AM', '1:00 PM', '4:00 PM'],
    saturday: [],
    sunday: []
  }
};

const instructors = JSON.parse(localStorage.getItem('studio-instructors') || '[]');
if (!instructors.find(i => i.email === '${tyrone.email}')) {
  instructors.push(tyroneAsInstructor);
  localStorage.setItem('studio-instructors', JSON.stringify(instructors));
  console.log('✅ Added Tyrone as instructor');
  alert('✅ Tyrone can now supervise students!');
}
    `);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

makeTyroneInstructor();

