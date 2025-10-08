import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = "force-dynamic"

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
    
    // Use raw SQL to avoid Prisma schema issues with emailNotifications column
    const user = await prisma.$queryRaw`
      INSERT INTO users (
        id, email, name, password, "businessName", "licenseNumber", "licenseState", 
        role, "selectedPlan", "hasActiveSubscription", "isLicenseVerified", 
        "subscriptionStatus", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), ${email}, ${name}, ${hashedPassword}, ${businessName || ''}, 
        ${licenseNumber || ''}, ${licenseState || ''}, ${role || 'artist'}, 
        ${selectedPlan || 'studio'}, true, true, 'active', NOW(), NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        name = EXCLUDED.name,
        "businessName" = EXCLUDED."businessName",
        "licenseNumber" = EXCLUDED."licenseNumber",
        "licenseState" = EXCLUDED."licenseState",
        role = EXCLUDED.role,
        "selectedPlan" = EXCLUDED."selectedPlan",
        "hasActiveSubscription" = EXCLUDED."hasActiveSubscription",
        "isLicenseVerified" = EXCLUDED."isLicenseVerified",
        "subscriptionStatus" = EXCLUDED."subscriptionStatus",
        "updatedAt" = NOW()
      RETURNING id, email, name, role, "selectedPlan"
    `
    
    const createdUser = Array.isArray(user) ? user[0] : user
    
    return NextResponse.json({ 
      success: true, 
      message: 'Instructor user created successfully',
      email: createdUser.email,
      id: createdUser.id,
      name: createdUser.name,
      role: createdUser.role
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

