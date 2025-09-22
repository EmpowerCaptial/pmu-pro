import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log('Creating Universal Beauty Studio Academy user...')
    
    const hashedPassword = await bcrypt.hash('adminteam!', 10)
    
    const user = await prisma.user.upsert({
      where: { email: 'universalbeautystudioacademy@gmail.com' },
      update: {},
      create: {
        email: 'universalbeautystudioacademy@gmail.com',
        name: 'Universal Beauty Studio Academy',
        password: hashedPassword,
        businessName: 'Universal Beauty Studio Academy',
        licenseNumber: 'UBSA001',
        licenseState: 'CA',
        role: 'owner',
        hasActiveSubscription: true,
        isLicenseVerified: true,
        subscriptionStatus: 'active'
      }
    })
    
    console.log('User created:', { id: user.id, email: user.email })
    
    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name }
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    )
  }
}
