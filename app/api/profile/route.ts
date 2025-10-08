import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Only include fields that definitely exist in the production database
const profileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  bio: z.string().optional(),
  studioName: z.string().optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  address: z.string().optional(),
  avatar: z.string().optional(),
  experience: z.string().optional(),
  venmoUsername: z.string().optional(),
  cashAppUsername: z.string().optional()
})

// GET /api/profile - Get user's profile
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        studioName: true,
        website: true,
        instagram: true,
        address: true,
        experience: true,
        venmoUsername: true,
        cashAppUsername: true,
        phone: true,
        businessName: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return profile data (no JSON parsing needed for these fields)
    const profile = {
      ...user,
      specialties: '', // Default empty since field doesn't exist in production DB
      certifications: '' // Default empty since field doesn't exist in production DB
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update user's profile
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = profileSchema.parse(body)

    // CRITICAL: Role-based field restrictions to prevent system breaking
    const restrictedFields = ['studioName', 'businessName']
    const userRole = user.role
    
    // Students and licensed artists in studio cannot change critical studio fields
    if ((userRole === 'student' || userRole === 'licensed' || userRole === 'instructor') && user.studioName) {
      for (const field of restrictedFields) {
        if (field in validatedData && validatedData[field as keyof typeof validatedData] !== undefined) {
          return NextResponse.json({
            error: 'Access denied',
            message: `${userRole === 'student' ? 'Students' : userRole === 'licensed' ? 'Licensed artists' : 'Instructors'} cannot modify ${field}. This field is managed by the studio owner to maintain system integrity.`
          }, { status: 403 })
        }
      }
    }

    // Only update fields that exist in the production database
    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.businessName !== undefined) updateData.businessName = validatedData.businessName
    if (validatedData.bio !== undefined) updateData.bio = validatedData.bio
    if (validatedData.studioName !== undefined) updateData.studioName = validatedData.studioName
    if (validatedData.website !== undefined) updateData.website = validatedData.website
    if (validatedData.instagram !== undefined) updateData.instagram = validatedData.instagram
    if (validatedData.address !== undefined) updateData.address = validatedData.address
    if (validatedData.avatar !== undefined) updateData.avatar = validatedData.avatar
    if (validatedData.experience !== undefined) updateData.experience = validatedData.experience
    if (validatedData.venmoUsername !== undefined) updateData.venmoUsername = validatedData.venmoUsername
    if (validatedData.cashAppUsername !== undefined) updateData.cashAppUsername = validatedData.cashAppUsername

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        studioName: true,
        website: true,
        instagram: true,
        address: true,
        experience: true,
        venmoUsername: true,
        cashAppUsername: true,
        phone: true,
        businessName: true
      }
    })

    // Return the updated profile
    const profile = {
      ...updatedUser,
      specialties: '', // Default empty since field doesn't exist in production DB
      certifications: '' // Default empty since field doesn't exist in production DB
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error updating profile:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to update profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}