import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = "force-dynamic"

/**
 * POST /api/migrate/localstorage-to-db
 * 
 * Migrates localStorage data (team members, staff, artists) to the database.
 * This endpoint accepts data from the client's localStorage and creates database records.
 */
export async function POST(request: NextRequest) {
  try {
    const ownerEmail = request.headers.get('x-user-email')
    if (!ownerEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the owner to determine the studio name
    const owner = await prisma.user.findUnique({
      where: { email: ownerEmail },
      select: {
        id: true,
        studioName: true,
        businessName: true,
        role: true
      }
    })

    if (!owner || !['owner', 'director', 'manager', 'admin'].includes(owner.role?.toLowerCase() || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { teamMembers = [], staffMembers = [], artistProfiles = [] } = body

    const studioName = owner.studioName || owner.businessName || 'Studio'
    const results = {
      teamMembers: { created: 0, skipped: 0, errors: [] as string[] },
      staffMembers: { created: 0, skipped: 0, errors: [] as string[] },
      artistProfiles: { updated: 0, skipped: 0, errors: [] as string[] }
    }

    // Migrate team members (staff, instructors, students)
    for (const member of teamMembers) {
      try {
        // Skip if already exists
        const existing = await prisma.user.findUnique({
          where: { email: member.email }
        })

        if (existing) {
          results.teamMembers.skipped++
          continue
        }

        // Generate a default password if not provided
        const defaultPassword = member.password || `temp${Date.now().toString().slice(-6)}`
        const hashedPassword = await bcrypt.hash(defaultPassword, 12)

        // Map role correctly
        let role = member.role?.toLowerCase() || 'student'
        if (['staff', 'hr', 'director', 'manager'].includes(role)) {
          // Keep as is for staff roles
        } else if (role === 'licensed') {
          role = 'licensed'
        } else if (role === 'instructor') {
          role = 'instructor'
        } else {
          role = 'student'
        }

        await prisma.user.create({
          data: {
            email: member.email,
            name: member.name || 'Team Member',
            password: hashedPassword,
            role: role,
            selectedPlan: 'studio',
            hasActiveSubscription: true,
            subscriptionStatus: 'active',
            studioName: member.studioName || studioName,
            businessName: member.businessName || studioName,
            licenseNumber: (role === 'licensed' || role === 'instructor') ? (member.licenseNumber || 'PENDING') : 'N/A',
            licenseState: (role === 'licensed' || role === 'instructor') ? (member.licenseState || 'PENDING') : 'N/A',
            phone: member.phone || null,
            avatar: member.avatar || null,
            isLicenseVerified: role === 'licensed' || role === 'instructor'
          }
        })

        results.teamMembers.created++
      } catch (error: any) {
        console.error(`Error migrating team member ${member.email}:`, error)
        results.teamMembers.errors.push(`${member.email}: ${error.message}`)
      }
    }

    // Migrate staff members (convert to team members with staff role)
    for (const staff of staffMembers) {
      try {
        const email = staff.email || staff.username

        if (!email) {
          results.staffMembers.errors.push(`Staff member missing email: ${staff.id}`)
          continue
        }

        // Skip if already exists
        const existing = await prisma.user.findUnique({
          where: { email }
        })

        if (existing) {
          results.staffMembers.skipped++
          continue
        }

        // Generate a default password
        const defaultPassword = staff.password || staff.temporaryPassword || `temp${Date.now().toString().slice(-6)}`
        const hashedPassword = await bcrypt.hash(defaultPassword, 12)

        // Map staff role to user role
        let role = 'staff'
        if (staff.role === 'director') {
          role = 'director'
        } else if (staff.role === 'manager') {
          role = 'manager'
        } else if (staff.role === 'representative') {
          role = 'staff'
        }

        const fullName = `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || staff.username || 'Staff Member'

        await prisma.user.create({
          data: {
            email,
            name: fullName,
            password: hashedPassword,
            role: role,
            selectedPlan: 'studio',
            hasActiveSubscription: true,
            subscriptionStatus: 'active',
            studioName: studioName,
            businessName: studioName,
            licenseNumber: 'N/A',
            licenseState: 'N/A'
          }
        })

        results.staffMembers.created++
      } catch (error: any) {
        console.error(`Error migrating staff member ${staff.id}:`, error)
        results.staffMembers.errors.push(`${staff.id || 'unknown'}: ${error.message}`)
      }
    }

    // Migrate artist profiles (update existing users with profile data)
    for (const profile of artistProfiles) {
      try {
        const email = profile.email
        if (!email) {
          results.artistProfiles.errors.push(`Artist profile missing email`)
          continue
        }

        const existing = await prisma.user.findUnique({
          where: { email }
        })

        if (!existing) {
          results.artistProfiles.skipped++
          continue
        }

        // Update user with profile data
        await prisma.user.update({
          where: { email },
          data: {
            name: profile.name || existing.name,
            bio: profile.bio || existing.bio,
            phone: profile.phone || existing.phone,
            website: profile.website || existing.website,
            instagram: profile.instagram || existing.instagram,
            avatar: profile.avatar || existing.avatar,
            specialties: profile.specialties || existing.specialties,
            experience: profile.experience || existing.experience,
            businessHours: profile.businessHours || existing.businessHours,
            address: profile.address ? JSON.stringify(profile.address) : existing.address
          }
        })

        results.artistProfiles.updated++
      } catch (error: any) {
        console.error(`Error migrating artist profile ${profile.email}:`, error)
        results.artistProfiles.errors.push(`${profile.email}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Failed to migrate data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

