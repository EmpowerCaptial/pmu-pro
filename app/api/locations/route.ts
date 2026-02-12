import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/locations - Get all locations
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only allow Instructors, Directors, and Owners
    const allowedRoles = ['instructor', 'director', 'owner']
    if (!allowedRoles.includes(user.role.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: locations
    })

  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}

// POST /api/locations - Create a new location
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only allow Instructors, Directors, and Owners
    const allowedRoles = ['instructor', 'director', 'owner']
    if (!allowedRoles.includes(user.role.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { name, address, city, state, zipCode } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      )
    }

    const location = await prisma.location.create({
      data: {
        name,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      data: location
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating location:', error)
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Location name already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create location' },
      { status: 500 }
    )
  }
}

// PUT /api/locations - Update a location
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only allow Instructors, Directors, and Owners
    const allowedRoles = ['instructor', 'director', 'owner']
    if (!allowedRoles.includes(user.role.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { locationId, updates } = await request.json()

    if (!locationId) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      )
    }

    const allowedUpdates = ['name', 'address', 'city', 'state', 'zipCode', 'isActive']
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: filteredUpdates
    })

    return NextResponse.json({
      success: true,
      data: updatedLocation
    })

  } catch (error: any) {
    console.error('Error updating location:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Location name already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update location' },
      { status: 500 }
    )
  }
}

// DELETE /api/locations - Delete a location
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role - only owners can delete
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only owners can delete locations
    if (user.role.toLowerCase() !== 'owner') {
      return NextResponse.json({ error: 'Forbidden - Only owners can delete locations' }, { status: 403 })
    }

    const { locationId } = await request.json()

    if (!locationId) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      )
    }

    // Check if location has inventory items
    const itemCount = await prisma.inventoryItem.count({
      where: { locationId }
    })

    if (itemCount > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete location with ${itemCount} inventory items. Please reassign or remove items first.` },
        { status: 400 }
      )
    }

    await prisma.location.delete({
      where: { id: locationId }
    })

    return NextResponse.json({
      success: true,
      message: 'Location deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting location:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete location' },
      { status: 500 }
    )
  }
}

