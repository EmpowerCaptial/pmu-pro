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

    // Find the user whose email matches the handle
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        studioName: true,
        phone: true,
        website: true,
        instagram: true,
        address: true,
        businessHours: true,
        specialties: true,
        experience: true,
        rating: true,
        reviewCount: true
      }
    })

    // Find the user whose email matches the handle
    const artist = users.find(user => {
      const emailHandle = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
      return emailHandle === handle.toLowerCase()
    })

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    // Get services for this artist
    let services: any[] = []
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
      services = artistServices
    } catch (error) {
      console.error('Error loading services:', error)
    }

    // Get products for this artist
    let products: any[] = []
    try {
      const artistProducts = await prisma.product.findMany({
        where: {
          userId: artist.id,
          isActive: true
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          category: true,
          images: true,
          isDigital: true,
          stockQuantity: true
        }
      })
      products = artistProducts.map(product => ({
        ...product,
        images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images
      }))
    } catch (error) {
      console.error('Error loading products:', error)
    }

    return NextResponse.json({
      artist: {
        ...artist,
        handle: handle
      },
      services,
      products
    })

  } catch (error) {
    console.error('Error in artist API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}