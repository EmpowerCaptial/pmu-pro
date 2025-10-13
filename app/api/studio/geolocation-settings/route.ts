import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    // Get user to verify role and get studio name
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only owners, managers, and directors can access geolocation settings
    if (!['owner', 'manager', 'director'].includes(user.role)) {
      return NextResponse.json({ 
        error: 'Access denied',
        message: 'Only studio owners, managers, and directors can access geolocation settings'
      }, { status: 403 })
    }

    const studioName = user.studioName || user.businessName

    if (!studioName) {
      return NextResponse.json({ 
        success: true, 
        settings: {
          address: '',
          lat: null,
          lng: null,
          radius: 50,
          isConfigured: false
        }
      })
    }

    // Fetch settings from database
    const settings = await prisma.studioSettings.findUnique({
      where: { studioName }
    })

    if (!settings) {
      return NextResponse.json({ 
        success: true, 
        settings: {
          address: '',
          lat: null,
          lng: null,
          radius: 50,
          isConfigured: false
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      settings: {
        address: settings.address,
        lat: settings.lat,
        lng: settings.lng,
        radius: settings.radius,
        isConfigured: true
      }
    })

  } catch (error) {
    console.error('Error fetching geolocation settings:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch geolocation settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    const data = await request.json()

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    if (!data.address || !data.lat || !data.lng) {
      return NextResponse.json({ error: 'Address and coordinates are required' }, { status: 400 })
    }

    // Get user to verify role and get studio name
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only owners, managers, and directors can update geolocation settings
    if (!['owner', 'manager', 'director'].includes(user.role)) {
      return NextResponse.json({ 
        error: 'Access denied',
        message: 'Only studio owners, managers, and directors can update geolocation settings'
      }, { status: 403 })
    }

    const studioName = user.studioName || user.businessName

    if (!studioName) {
      return NextResponse.json({ 
        error: 'Studio name required',
        message: 'Please set your studio name in your profile before configuring geolocation'
      }, { status: 400 })
    }

    // Upsert settings to database
    const settings = await prisma.studioSettings.upsert({
      where: { studioName },
      update: {
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        radius: data.radius || 50,
        updatedBy: userEmail,
        isActive: true
      },
      create: {
        studioName,
        ownerEmail: userEmail,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        radius: data.radius || 50,
        updatedBy: userEmail,
        isActive: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Geolocation settings saved successfully',
      settings: {
        address: settings.address,
        lat: settings.lat,
        lng: settings.lng,
        radius: settings.radius,
        isConfigured: true
      }
    })

  } catch (error) {
    console.error('Error saving geolocation settings:', error)
    return NextResponse.json({ 
      error: 'Failed to save geolocation settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}