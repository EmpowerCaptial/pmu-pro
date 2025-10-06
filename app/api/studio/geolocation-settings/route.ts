import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

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
      radius: 1.5, // 5 feet in meters
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

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

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

    // For now, we'll store the settings in a way that the hook can access them
    // In a real implementation, you'd have a separate table for studio settings
    const studioKey = `geolocation-settings-${user.studioName || user.businessName || 'default'}`
    
    // Store settings in a way that can be accessed by the hook
    // This is a temporary solution - in production you'd use a proper database table
    const settingsToStore = {
      ...settings,
      studioName: user.studioName || user.businessName,
      updatedBy: userEmail,
      updatedAt: new Date().toISOString()
    }

    // For now, we'll return success and the frontend will handle localStorage
    // In a real implementation, you'd save to a database table
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
