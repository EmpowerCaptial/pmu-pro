import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { memberEmail, newPlan, reason, ownerEmail } = await request.json()

    if (!memberEmail || !newPlan || !ownerEmail) {
      return NextResponse.json(
        { error: 'Member email, new plan, and owner email are required' },
        { status: 400 }
      )
    }

    // Validate the new plan
    if (!['starter', 'professional'].includes(newPlan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be starter or professional' },
        { status: 400 }
      )
    }

    // Find the owner to verify permissions
    const owner = await prisma.user.findUnique({
      where: { email: ownerEmail },
      select: {
        id: true,
        email: true,
        role: true,
        selectedPlan: true,
        studioName: true
      }
    })

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    if (owner.selectedPlan !== 'studio') {
      return NextResponse.json(
        { error: 'Only Enterprise Studio owners can separate members' },
        { status: 403 }
      )
    }

    // Find the member to separate
    const member = await prisma.user.findUnique({
      where: { email: memberEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studioName: true,
        businessName: true,
        phone: true,
        address: true,
        bio: true,
        specialties: true,
        certifications: true,
        avatar: true
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (member.studioName !== owner.studioName) {
      return NextResponse.json(
        { error: 'Member does not belong to this studio' },
        { status: 403 }
      )
    }

    // Create a new individual account for the member
    const newPassword = `TempPass${Date.now()}` // Temporary password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    const newUserId = `cmg${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    
    await prisma.$executeRaw`
      INSERT INTO "users" (
        "id", "email", "name", "password", "role", "selectedPlan", 
        "hasActiveSubscription", "isLicenseVerified", "businessName", "studioName",
        "licenseNumber", "licenseState", "phone", "address", "bio", 
        "specialties", "certifications", "avatar", "createdAt", "updatedAt"
      ) VALUES (
        ${newUserId}, ${member.email}, ${member.name}, ${hashedPassword}, 
        ${member.role === 'student' ? 'artist' : member.role}, ${newPlan},
        false, ${member.role === 'licensed' || member.role === 'instructor'}, 
        ${member.businessName || member.name}, ${member.businessName || member.name},
        ${member.role === 'licensed' || member.role === 'instructor' ? 'PENDING' : ''}, 
        ${member.role === 'licensed' || member.role === 'instructor' ? 'PENDING' : ''},
        ${member.phone || ''}, ${member.address || ''}, ${member.bio || ''},
        ${member.specialties || ''}, ${member.certifications || ''}, ${member.avatar || ''},
        NOW(), NOW()
      )
    `

    // Log the separation for audit purposes
    console.log(`Member separation: ${member.email} separated from ${owner.studioName} to ${newPlan} plan`)

    return NextResponse.json({
      success: true,
      message: 'Member successfully separated from studio',
      newAccount: {
        email: member.email,
        name: member.name,
        newPlan: newPlan,
        temporaryPassword: newPassword,
        newRole: member.role === 'student' ? 'artist' : member.role
      }
    })

  } catch (error) {
    console.error('Error separating member from studio:', error)
    return NextResponse.json(
      { error: 'Failed to separate member from studio' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
