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

    // Find artist by handle (you might need to add a handle field to your User model)
    // For now, we'll use a mock approach
    const artist = await prisma.user.findFirst({
      where: {
        // You might want to add a 'handle' field to your User model
        // For now, we'll use email as a fallback
        email: {
          contains: handle
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        // Add more fields as needed
      }
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

    return NextResponse.json({
      artist: {
        id: artist.id,
        name: artist.name,
        email: artist.email,
        handle: handle,
        bio: 'Professional PMU artist', // You might want to add this to your User model
        specialties: ['Microblading', 'Lip Blush', 'Eyeliner'], // You might want to add this to your User model
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
