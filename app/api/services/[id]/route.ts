import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// PUT /api/services/[id] - Update a service
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, defaultDuration, defaultPrice, category, imageUrl, isCustomImage, isActive } = body

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

    // Update service
    const service = await prisma.service.update({
      where: { 
        id: params.id,
        userId: user.id // Ensure user owns this service
      },
      data: {
        name,
        description: description || null,
        defaultDuration: parseInt(defaultDuration),
        defaultPrice: parseFloat(defaultPrice),
        category,
        imageUrl: imageUrl || null,
        isCustomImage: isCustomImage || false,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({ service })

  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Failed to update service', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE /api/services/[id] - Delete a service
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Delete service
    await prisma.service.delete({
      where: { 
        id: params.id,
        userId: user.id // Ensure user owns this service
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
