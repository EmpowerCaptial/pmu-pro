import { PrismaClient } from '@prisma/client'
import { MagicLinkService } from '../lib/magic-link'

const prisma = new PrismaClient()

async function testMagicLinkSystem() {
  try {
    console.log('🧪 Testing Magic Link System...\n')
    
    // 1. Check if test user exists
    console.log('1. Checking test user...')
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    
    if (!user) {
      console.log('❌ Test user not found. Creating one...')
      // Create test user if it doesn't exist
      await prisma.user.create({
        data: {
          name: 'Test Artist',
          email: 'test@example.com',
          password: 'hashedpassword123',
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
      console.log('✅ Test user created')
    } else {
      console.log('✅ Test user found:', user.email)
      console.log('   License verified:', user.isLicenseVerified)
      console.log('   Has subscription:', user.hasActiveSubscription)
    }
    
    // 2. Test magic link token creation
    console.log('\n2. Testing magic link token creation...')
    const { token, expiresAt } = await MagicLinkService.createToken('test@example.com')
    console.log('✅ Token created successfully')
    console.log('   Token:', token.substring(0, 20) + '...')
    console.log('   Expires:', expiresAt.toISOString())
    
    // 3. Test magic link URL generation
    console.log('\n3. Testing magic link URL generation...')
    const baseUrl = 'https://pmu-guide.com'
    const magicLinkUrl = MagicLinkService.generateMagicLinkUrl(token, baseUrl)
    console.log('✅ Magic link URL generated')
    console.log('   URL:', magicLinkUrl)
    
    // 4. Test email sending (will log to console in development)
    console.log('\n4. Testing email sending...')
    await MagicLinkService.sendMagicLinkEmail('test@example.com', magicLinkUrl)
    console.log('✅ Email sent successfully')
    
    // 5. Test token verification
    console.log('\n5. Testing token verification...')
    const verification = await MagicLinkService.verifyToken(token)
    if (verification) {
      console.log('✅ Token verified successfully')
      console.log('   User ID:', verification.userId)
      console.log('   Email:', verification.email)
    } else {
      console.log('❌ Token verification failed')
    }
    
    // 6. Check database state
    console.log('\n6. Checking database state...')
    const tokens = await prisma.magicLinkToken.findMany({
      where: { email: 'test@example.com' }
    })
    console.log('✅ Found', tokens.length, 'tokens in database')
    tokens.forEach((token, index) => {
      console.log(`   Token ${index + 1}:`, {
        id: token.id.substring(0, 8) + '...',
        used: token.used,
        expiresAt: token.expiresAt.toISOString(),
        createdAt: token.createdAt.toISOString()
      })
    })
    
    console.log('\n🎉 Magic Link System Test Complete!')
    console.log('\n📧 To test the full flow:')
    console.log('1. Go to: https://pmu-guide.com/auth/login')
    console.log('2. Enter: test@example.com')
    console.log('3. Check console for magic link')
    console.log('4. Click the magic link to authenticate')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testMagicLinkSystem()
