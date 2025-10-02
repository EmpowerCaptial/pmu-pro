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

    // Handle special cases first
    if (handle === 'demo-artist' || handle === 'universalbeautystudioacademy') {
      // Get services and products for demo artist
      let demoServices: any[] = []
      let demoProducts: any[] = []
      try {
        const demoUser = await prisma.user.findUnique({
          where: { email: 'universalbeautystudioacademy@gmail.com' }
        })
        
        if (demoUser) {
          const services = await prisma.service.findMany({
            where: {
              userId: demoUser.id,
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
          demoServices = services
          
          const products = await prisma.product.findMany({
            where: {
              userId: demoUser.id,
              isActive: true
            },
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              category: true,
              images: true
            }
          })
          demoProducts = products
          
          console.log('Demo user ID:', demoUser.id)
          console.log('Demo services found:', services.length)
          console.log('Demo products found:', products.length)
        }
      } catch (error) {
        console.error('Error fetching demo services and products:', error)
      }

      // Return demo artist data
      return NextResponse.json({
        artist: {
          id: 'demo-artist',
          name: 'Demo Artist',
          email: 'universalbeautystudioacademy@gmail.com',
          handle: handle,
          avatar: null,
          bio: 'Professional PMU artist specializing in natural-looking permanent makeup',
          studioName: 'Universal Beauty Studio Academy',
          phone: null,
          website: null,
          instagram: null,
          address: null,
          businessHours: null,
          specialties: ['Microblading', 'Lip Blush', 'Eyeliner'],
          experience: '5+ years',
          rating: 4.9,
          reviewCount: 127
        },
        portfolio: [],
        services: demoServices,
        products: demoProducts
      })
    }

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
      return emailHandle === handle.toLowerCase()
    })

    if (!artist) {
      console.log(`Artist not found for handle: ${handle}`)
      console.log('Available users:', users.map(u => ({ email: u.email, handle: u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-') })))
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    // Get artist's public portfolio items (you'll need to implement this based on your portfolio storage)
    // For now, we'll return empty arrays
    const portfolio: any[] = []
    const services: any[] = []
    const products: any[] = []

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

    // Get artist's products
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
          images: true
        }
      })
      
      products.push(...artistProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
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
      services,
      products
    })

  } catch (error) {
    console.error('Error fetching artist data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artist data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
