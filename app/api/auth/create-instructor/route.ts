import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
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

