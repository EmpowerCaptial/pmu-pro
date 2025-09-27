import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET /api/artist/[handle] - Get artist's public profile, portfolio, and services
export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const handle = params.handle

    // Try to find artist by checking if any email matches the handle
    // The handle is generated from email by taking the part before @ and converting to lowercase with dashes
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        // Add more fields as needed
      }
    })

    // Find the user whose email matches the handle
    const artist = users.find(user => {
      const emailHandle = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
      return emailHandle === handle
    })

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    // Get artist's public portfolio items (you'll need to implement this based on your portfolio storage)
    // For now, we'll return empty arrays
    const portfolio: any[] = []
    const services: any[] = []

    // Get artist's services
    try {
      const artistServices = await prisma.service.findMany({
        where: {
          userId: artist.id,
          isActive: true
        },
        select: {
          id: true,
          name: true,
          description: true,
          defaultDuration: true,
          defaultPrice: true,
          category: true,
          imageUrl: true
        }
      })
      
      services.push(...artistServices)
    } catch (error) {
      console.error('Error fetching services:', error)
    }

    // For now, return default profile data since localStorage isn't available on server
    // In production, you'd store this profile data in the database
    return NextResponse.json({
      artist: {
        id: artist.id,
        name: artist.name,
        email: artist.email,
        handle: handle,
        avatar: null, // Will be loaded client-side from localStorage
        bio: 'Professional PMU artist specializing in natural-looking permanent makeup',
        studioName: artist.name + "'s Studio",
        phone: null,
        website: null,
        instagram: null,
        address: null,
        businessHours: null,
        specialties: ['Microblading', 'Lip Blush', 'Eyeliner'],
        experience: '5+ years',
        rating: 4.9, // You might want to add this to your User model
        reviewCount: 127 // You might want to add this to your User model
      },
      portfolio,
      services
    })

  } catch (error) {
    console.error('Error fetching artist data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artist data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
