import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Checking Tierra account in production...')
    
    // Check if Tierra exists
    const user = await prisma.user.findUnique({
      where: { email: 'tierra.cochrane51@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        studioName: true,
        createdAt: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ 
        found: false,
        message: 'Tierra account not found in production database'
      })
    }
    
    // Test password
    const testPassword = 'tierraj22!'
    const isPasswordValid = await bcrypt.compare(testPassword, user.password)
    
    return NextResponse.json({
      found: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        studioName: user.studioName,
        createdAt: user.createdAt
      },
      passwordTest: {
        testPassword,
        isValid: isPasswordValid,
        hashLength: user.password.length,
        hashPrefix: user.password.substring(0, 10)
      }
    })
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'reset-password') {
      console.log('🔧 Resetting Tierra password in production...')
      
      const newPassword = 'tierraj22!'
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      
      const updatedUser = await prisma.user.update({
        where: { email: 'tierra.cochrane51@gmail.com' },
        data: { password: hashedPassword },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Password reset successfully',
        user: updatedUser
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ 
      error: 'Password reset failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
