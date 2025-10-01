import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const profileSchema = z.object({
  bio: z.string().optional(),
  studioName: z.string().optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  address: z.string().optional(), // JSON string
  businessHours: z.string().optional(), // JSON string
  specialties: z.string().optional(), // JSON string array
  experience: z.string().optional(),
  certifications: z.string().optional(), // JSON string array
  avatar: z.string().optional(),
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
        businessHours: true,
        specialties: true,
        experience: true,
        certifications: true,
        venmoUsername: true,
        cashAppUsername: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse JSON fields
    const profile = {
      ...user,
      address: user.address ? JSON.parse(user.address) : null,
      businessHours: user.businessHours ? JSON.parse(user.businessHours) : null,
      specialties: user.specialties ? JSON.parse(user.specialties) : [],
      certifications: user.certifications ? JSON.parse(user.certifications) : []
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

    // Convert objects to JSON strings for storage
    const updateData: any = {}
    if (validatedData.bio !== undefined) updateData.bio = validatedData.bio
    if (validatedData.studioName !== undefined) updateData.studioName = validatedData.studioName
    if (validatedData.website !== undefined) updateData.website = validatedData.website
    if (validatedData.instagram !== undefined) updateData.instagram = validatedData.instagram
    if (validatedData.avatar !== undefined) updateData.avatar = validatedData.avatar
    if (validatedData.experience !== undefined) updateData.experience = validatedData.experience
    if (validatedData.venmoUsername !== undefined) updateData.venmoUsername = validatedData.venmoUsername
    if (validatedData.cashAppUsername !== undefined) updateData.cashAppUsername = validatedData.cashAppUsername
    
    if (validatedData.address !== undefined) {
      updateData.address = typeof validatedData.address === 'string' 
        ? validatedData.address 
        : JSON.stringify(validatedData.address)
    }
    if (validatedData.businessHours !== undefined) {
      updateData.businessHours = typeof validatedData.businessHours === 'string'
        ? validatedData.businessHours
        : JSON.stringify(validatedData.businessHours)
    }
    if (validatedData.specialties !== undefined) {
      updateData.specialties = typeof validatedData.specialties === 'string'
        ? validatedData.specialties
        : JSON.stringify(validatedData.specialties)
    }
    if (validatedData.certifications !== undefined) {
      updateData.certifications = typeof validatedData.certifications === 'string'
        ? validatedData.certifications
        : JSON.stringify(validatedData.certifications)
    }

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
        businessHours: true,
        specialties: true,
        experience: true,
        certifications: true,
        venmoUsername: true,
        cashAppUsername: true
      }
    })

    // Parse JSON fields for response
    const profile = {
      ...updatedUser,
      address: updatedUser.address ? JSON.parse(updatedUser.address) : null,
      businessHours: updatedUser.businessHours ? JSON.parse(updatedUser.businessHours) : null,
      specialties: updatedUser.specialties ? JSON.parse(updatedUser.specialties) : [],
      certifications: updatedUser.certifications ? JSON.parse(updatedUser.certifications) : []
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error updating profile:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

