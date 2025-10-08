import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test 1: Check if we can connect
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test 2: Check if emailNotifications column exists
    const columnExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'emailNotifications'
      );
    `;
    
    console.log('📊 emailNotifications column exists:', (columnExists as any)[0].exists)
    
    // Test 3: Try to create a test user
    const testUser = await prisma.user.create({
      data: {
        email: 'api-test@example.com',
        name: 'API Test User',
        password: 'hashedpassword123',
        role: 'artist',
        selectedPlan: 'starter',
        hasActiveSubscription: false,
        isLicenseVerified: false,
        businessName: 'Test Business',
        studioName: 'Test Studio',
        licenseNumber: 'TEST123',
        licenseState: 'CA'
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });
    
    console.log('✅ User creation successful:', testUser)
    
    // Clean up
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Test user cleaned up')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection test successful',
      emailNotificationsColumnExists: (columnExists as any)[0].exists,
      testUserCreated: true
    })

  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      success: false,
      error: 'Database connection test failed',
      details: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }}
