import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET /api/services - Get all services for a user
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 401 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        businessName: true,
        studioName: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get services based on user role
    let services: any[] = []
    if (user.studioName && (user.role === 'student' || user.role === 'licensed' || user.role === 'instructor')) {
      // For studio members, get services from the studio owner
      // UNIVERSAL FIX: Find the actual studio owner by businessName match
      // This prevents issues with multiple users having same studioName
      
      let studioOwner = await prisma.user.findFirst({
        where: { 
          studioName: user.studioName,
          role: 'owner',
          businessName: user.studioName // Match businessName to studioName for consistency
        },
        select: { id: true, name: true, email: true }
      })
      
      // If no exact match, find any owner with same studioName
      if (!studioOwner) {
        studioOwner = await prisma.user.findFirst({
          where: { 
            studioName: user.studioName,
            role: 'owner'
          },
          select: { id: true, name: true, email: true }
        })
      }
      
      // If still no owner, fallback to managers/directors
      if (!studioOwner) {
        studioOwner = await prisma.user.findFirst({
          where: { 
            studioName: user.studioName,
            role: { in: ['manager', 'director'] }
          },
          select: { id: true, name: true, email: true }
        })
      }
      
      if (studioOwner) {
        services = await prisma.service.findMany({
          where: { userId: studioOwner.id },
          orderBy: { createdAt: 'desc' }
        })
        
        // Log for debugging
        console.log(`Services API: Found ${services.length} services for studio member ${user.email} from owner ${studioOwner.email}`)
      } else {
        console.log(`Services API: No studio owner found for studioName: ${user.studioName}`)
        services = []
      }
    } else {
      // For owners, managers, directors, and artists with own accounts
      services = await prisma.service.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ services })

  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/services - Create a new service
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, defaultDuration, defaultPrice, category, imageUrl, isCustomImage } = body

    if (!name || !defaultDuration || !defaultPrice || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        businessName: true,
        studioName: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user can manage services
    const canManageServices = user.role === 'owner' || 
                             user.role === 'manager' || 
                             user.role === 'director' ||
                             (user.role === 'artist' && !user.studioName) // Artist with own account

    if (!canManageServices) {
      return NextResponse.json({ 
        error: 'Access denied', 
        message: 'Only studio owners, managers, directors, and artists with their own accounts can manage services' 
      }, { status: 403 })
    }

    // Create new service
    const service = await prisma.service.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        defaultDuration: parseInt(defaultDuration),
        defaultPrice: parseFloat(defaultPrice),
        category,
        imageUrl: imageUrl || null,
        isCustomImage: isCustomImage || false
      }
    })

    return NextResponse.json({ service }, { status: 201 })

  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Failed to create service', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}