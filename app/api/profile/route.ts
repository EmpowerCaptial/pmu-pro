import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const profileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  businessName: z.string().optional(),
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

    // Parse JSON fields safely
    const profile = {
      ...user,
      address: user.address || null,
      businessHours: user.businessHours ? (() => {
        try { return JSON.parse(user.businessHours) } catch { return user.businessHours }
      })() : null,
      specialties: user.specialties ? (() => {
        try { 
          const parsed = JSON.parse(user.specialties)
          return Array.isArray(parsed) ? parsed.join(', ') : user.specialties
        } catch { 
          return user.specialties 
        }
      })() : '',
      certifications: user.certifications ? (() => {
        try { 
          const parsed = JSON.parse(user.certifications)
          return Array.isArray(parsed) ? parsed.join(', ') : user.certifications
        } catch { 
          return user.certifications 
        }
      })() : ''
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
    // Only update fields that exist in the database schema
    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.businessName !== undefined) updateData.businessName = validatedData.businessName
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
      // Handle specialties as JSON string (comma-separated values)
      const specialtiesArray = validatedData.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0)
      updateData.specialties = JSON.stringify(specialtiesArray)
    }
    if (validatedData.certifications !== undefined) {
      // Handle certifications as JSON string (comma-separated values)
      const certificationsArray = validatedData.certifications.split(',').map(c => c.trim()).filter(c => c.length > 0)
      updateData.certifications = JSON.stringify(certificationsArray)
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
      address: updatedUser.address || null,
      businessHours: updatedUser.businessHours ? (() => {
        try { return JSON.parse(updatedUser.businessHours) } catch { return updatedUser.businessHours }
      })() : null,
      specialties: updatedUser.specialties ? (() => {
        try { 
          const parsed = JSON.parse(updatedUser.specialties)
          return Array.isArray(parsed) ? parsed.join(', ') : updatedUser.specialties
        } catch { 
          return updatedUser.specialties 
        }
      })() : '',
      certifications: updatedUser.certifications ? (() => {
        try { 
          const parsed = JSON.parse(updatedUser.certifications)
          return Array.isArray(parsed) ? parsed.join(', ') : updatedUser.certifications
        } catch { 
          return updatedUser.certifications 
        }
      })() : ''
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

