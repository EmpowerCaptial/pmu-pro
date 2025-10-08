import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { userEmail, localStorageServices } = await request.json()

    if (!userEmail || !localStorageServices) {
      return NextResponse.json(
        { error: 'User email and localStorage services are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
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
                             (user.role === 'artist' && !user.studioName)

    if (!canManageServices) {
      return NextResponse.json({ 
        error: 'Access denied', 
        message: 'Only studio owners, managers, directors, and artists with their own accounts can migrate services' 
      }, { status: 403 })
    }

    let migratedCount = 0
    const errors: string[] = []

    // Migrate each localStorage service to database
    for (const service of localStorageServices) {
      try {
        // Check if service already exists (by name and user)
        const existingService = await prisma.service.findFirst({
          where: {
            userId: user.id,
            name: service.name
          }
        })

        if (existingService) {
          console.log(`Service "${service.name}" already exists for user ${user.email}`)
          continue
        }

        // Create new service in database
        await prisma.service.create({
          data: {
            userId: user.id,
            name: service.name,
            description: service.description || null,
            defaultDuration: parseInt(service.defaultDuration) || 60,
            defaultPrice: parseFloat(service.defaultPrice) || 0,
            category: service.category || 'other',
            imageUrl: service.imageUrl || null,
            isCustomImage: service.isCustomImage || false
          }
        })

        migratedCount++
        console.log(`Migrated service: ${service.name} for user ${user.email}`)
      } catch (error) {
        const errorMsg = `Failed to migrate service "${service.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${migratedCount} services`,
      migratedCount,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error migrating services:', error)
    return NextResponse.json(
      { error: 'Failed to migrate services', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }}
