import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Create a test user with verified license and active subscription
    const user = await prisma.user.create({
      data: {
        name: 'Test Artist',
        email: 'test@example.com',
        password: 'hashedpassword123', // In real app, this would be bcrypt hashed
        businessName: 'Test PMU Studio',
        phone: '+1234567890',
        licenseNumber: 'TEST123456',
        licenseState: 'CA',
        yearsExperience: '5',
        selectedPlan: 'pro',
        isLicenseVerified: true,
        hasActiveSubscription: true,
        role: 'artist',
        subscriptionStatus: 'active'
      }
    })

    console.log('✅ Test user created successfully:')
    console.log('ID:', user.id)
    console.log('Email:', user.email)
    console.log('Name:', user.name)
    console.log('License Verified:', user.isLicenseVerified)
    console.log('Has Active Subscription:', user.hasActiveSubscription)
    console.log('---')
    console.log('You can now test the magic link system with:')
    console.log('Email: test@example.com')
    console.log('---')
    console.log('The magic link will be logged to the console in development mode.')
    
  } catch (error) {
    console.error('❌ Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
