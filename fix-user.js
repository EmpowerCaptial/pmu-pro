const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function fixUser() {
  const prisma = new PrismaClient()
  
  try {
    const hashedPassword = await bcrypt.hash('Tyronej22!', 10)
    
    const user = await prisma.user.upsert({
      where: { email: 'admin@universalbeautystudio.com' },
      update: {
        password: hashedPassword,
        selectedPlan: 'studio',
        hasActiveSubscription: true,
        isLicenseVerified: true,
        role: 'artist'
      },
      create: {
        email: 'admin@universalbeautystudio.com',
        name: 'Universal Beauty Studio Admin',
        password: hashedPassword,
        businessName: 'Universal Beauty Studio',
        licenseNumber: 'UBS001',
        licenseState: 'CA',
        role: 'artist',
        selectedPlan: 'studio',
        hasActiveSubscription: true,
        isLicenseVerified: true,
        subscriptionStatus: 'active'
      }
    })
    
    console.log('✅ User fixed:', user.email)
    
    // Test password
    const test = await bcrypt.compare('Tyronej22!', user.password)
    console.log('✅ Password test:', test ? 'PASS' : 'FAIL')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixUser()





