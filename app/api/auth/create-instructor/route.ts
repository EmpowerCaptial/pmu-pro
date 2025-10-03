import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      email, 
      name, 
      businessName, 
      licenseNumber, 
      licenseState, 
      password, 
      role, 
      selectedPlan 
    } = body

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Email, name, and password are required'
      }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        name,
        businessName,
        licenseNumber,
        licenseState,
        selectedPlan,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        role: role || 'artist'
      },
      create: {
        email,
        name,
        password: hashedPassword,
        businessName: businessName || '',
        licenseNumber: licenseNumber || '',
        licenseState: licenseState || '',
        role: role || 'artist',
        selectedPlan: selectedPlan || 'studio',
        hasActiveSubscription: true,
        isLicenseVerified: true,
        subscriptionStatus: 'active'
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Instructor user created successfully',
      email: user.email 
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

