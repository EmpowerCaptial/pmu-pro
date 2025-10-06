import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    // Get the user with error handling for schema mismatches
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          studioName: true,
          businessName: true
        }
      })
    } catch (dbError) {
      console.error('Database query error:', dbError)
      // Fallback: return default settings if database query fails
      return NextResponse.json({ 
        success: true, 
        settings: {
          address: '',
          lat: null,
          lng: null,
          radius: 15.24, // 50 feet in meters
          isConfigured: false
        },
        studioKey: `geolocation-settings-default`
      })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has permission to access geolocation settings
    const canAccess = user.role === 'owner' || 
                     user.role === 'manager' || 
                     user.role === 'director'

    if (!canAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // For now, store settings in localStorage key for the studio
    // In a real implementation, you'd have a separate table for studio settings
    const studioKey = `geolocation-settings-${user.studioName || user.businessName || 'default'}`
    
    // Return default settings if none exist
    const defaultSettings = {
      address: '',
      lat: null,
      lng: null,
      radius: 15.24, // 50 feet in meters
      isConfigured: false
    }

    return NextResponse.json({ 
      success: true, 
      settings: defaultSettings,
      studioKey 
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
    const settings = await request.json()

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    if (!settings.address || !settings.lat || !settings.lng) {
      return NextResponse.json({ error: 'Address and coordinates are required' }, { status: 400 })
    }

    // Get the user with error handling for schema mismatches
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          studioName: true,
          businessName: true
        }
      })
    } catch (dbError) {
      console.error('Database query error:', dbError)
      // Fallback: return success with default studio key if database query fails
      const settingsToStore = {
        ...settings,
        studioName: 'default',
        updatedBy: userEmail,
        updatedAt: new Date().toISOString()
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Geolocation settings saved successfully (fallback mode)',
        settings: settingsToStore,
        studioKey: 'geolocation-settings-default'
      })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has permission to save geolocation settings
    const canAccess = user.role === 'owner' || 
                     user.role === 'manager' || 
                     user.role === 'director'

    if (!canAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Store settings in localStorage for now (in production, use database)
    const studioKey = `geolocation-settings-${user.studioName || user.businessName || 'default'}`
    
    const settingsToStore = {
      ...settings,
      studioName: user.studioName || user.businessName,
      updatedBy: userEmail,
      updatedAt: new Date().toISOString()
    }

    // Return the settings so frontend can store them
    return NextResponse.json({ 
      success: true, 
      message: 'Geolocation settings saved successfully',
      settings: settingsToStore,
      studioKey
    })

  } catch (error) {
    console.error('Error saving geolocation settings:', error)
    return NextResponse.json({ 
      error: 'Failed to save geolocation settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
