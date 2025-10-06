import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simple test endpoint to debug profile update issues
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug profile update test')
    
    const userEmail = request.headers.get('x-user-email')
    console.log('User email:', userEmail)
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Test 1: Check if user exists
    console.log('Test 1: Checking if user exists...')
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true, email: true }
    })
    
    if (!user) {
      console.log('User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    console.log('User found:', user)

    // Test 2: Try a simple update
    console.log('Test 2: Trying simple name update...')
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { name: 'Test Update' },
      select: { id: true, name: true, email: true }
    })
    
    console.log('Update successful:', updatedUser)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Profile update test successful',
      user: updatedUser 
    })
    
  } catch (error) {
    console.error('❌ Debug test error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    return NextResponse.json({ 
      error: 'Debug test failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
