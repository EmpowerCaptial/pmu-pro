import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, businessName, studioName, selectedPlan, hasActiveSubscription, isLicenseVerified } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create the user account using raw SQL to avoid Prisma schema issues
    const userId = `cmg${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    
    await prisma.$executeRaw`
      INSERT INTO "users" (
        "id", "email", "name", "password", "role", "selectedPlan", 
        "hasActiveSubscription", "isLicenseVerified", "businessName", "studioName",
        "licenseNumber", "licenseState", "createdAt", "updatedAt"
      ) VALUES (
        ${userId}, ${email}, ${name}, ${hashedPassword}, ${role}, ${selectedPlan || 'studio'},
        ${hasActiveSubscription || true}, ${isLicenseVerified || false}, ${businessName || ''}, ${studioName || ''},
        ${role === 'licensed' || role === 'instructor' ? 'PENDING' : ''}, 
        ${role === 'licensed' || role === 'instructor' ? 'PENDING' : ''},
        NOW(), NOW()
      )
    `
    
    const newUser = {
      id: userId,
      email,
      name,
      role,
      selectedPlan: selectedPlan || 'studio',
      hasActiveSubscription: hasActiveSubscription || true,
      isLicenseVerified: isLicenseVerified || false,
      businessName: businessName || '',
      studioName: studioName || ''
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      user: newUser
    })

  } catch (error) {
    console.error('Error creating user:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = {
      error: 'Failed to create user',
      details: errorMessage,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorDetails, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
