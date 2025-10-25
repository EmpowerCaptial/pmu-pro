import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/artist/[handle] - Get artist's public profile, portfolio, and services
export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const handle = params.handle
    console.log('🔍 Debug - Looking for artist with handle:', handle);

    // Get all users to find the one whose handle matches (business name or email)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        businessName: true,
        studioName: true,
        phone: true,
        website: true,
        instagram: true,
        facebook: true,
        tiktok: true,
        twitter: true,
        youtube: true,
        address: true,
        businessHours: true,
        specialties: true,
        experience: true
      }
    })

    console.log('🔍 Debug - Found users:', users.map(u => ({
      email: u.email,
      businessName: (u as any).businessName,
      emailHandle: u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-'),
      businessHandle: (u as any).businessName ? (u as any).businessName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') : 'no-business-name'
    })));

    // Find the user whose business name OR email matches the handle
    // Priority: Email handle (unique) > Business name handle (may conflict)
    
    // First, check for exact email handle match (most reliable, guaranteed unique)
    let artist = users.find(user => {
      const emailHandle = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
      return emailHandle === handle.toLowerCase()
    })
    
    console.log('🔍 Debug - Email handle match:', artist ? 'FOUND' : 'NOT FOUND');
    
    // If no email match, try business name match
    if (!artist) {
      artist = users.find(user => {
        if (!(user as any).businessName || !(user as any).businessName.trim()) return false
        
        const businessHandle = (user as any).businessName
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
        
        return businessHandle === handle.toLowerCase()
      })
      
      console.log('🔍 Debug - Business name handle match:', artist ? 'FOUND' : 'NOT FOUND');
    }

    if (!artist) {
      console.log('❌ Artist not found for handle:', handle);
      console.log('Available handles:', users.map(u => ({
        email: u.email,
        emailHandle: u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-'),
        businessName: (u as any).businessName,
        businessHandle: (u as any).businessName ? (u as any).businessName
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '') : 'no-business-name'
      })));
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
        handle: handle,
        rating: 5.0, // Default rating
        reviewCount: 0 // Default review count
      },
      services,
      products
    })

  } catch (error) {
    console.error('Error in artist API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}