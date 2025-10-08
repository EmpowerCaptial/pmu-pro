import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ClientLimitService } from '@/lib/client-limit-service'

const clientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  dateOfBirth: z.string().optional(),
  emergencyContact: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  skinType: z.string().optional(),
  isActive: z.boolean().default(true)
})

// GET /api/clients - Get user's clients
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        businessName: true,
        studioName: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const clients = await prisma.client.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        analyses: true,
        procedures: true,
        documents: true
      }
    })

    return NextResponse.json({ clients })
  } catch (error) {
    console.error('Error fetching clients:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { 
        error: 'Failed to fetch clients',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/clients - Create new client
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        businessName: true,
        studioName: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check client limit before creating new client
    const currentClientCount = await prisma.client.count({
      where: { userId: user.id, isActive: true }
    })

    const userPlan = user.selectedPlan || 'starter'
    const canAddClient = ClientLimitService.canAddClient(userPlan, currentClientCount)

    if (!canAddClient) {
      const upgradeMessage = ClientLimitService.getUpgradeMessage(userPlan, currentClientCount)
      const planComparison = ClientLimitService.getPlanComparison(userPlan)
      
      return NextResponse.json({ 
        error: 'Client limit reached',
        message: upgradeMessage,
        upgradeRequired: true,
        planComparison,
        currentClientCount,
        maxAllowed: ClientLimitService.getMaxClientsForPlan(userPlan)
      }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = clientSchema.parse(body)

    const client = await prisma.client.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        notes: validatedData.notes,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        emergencyContact: validatedData.emergencyContact,
        medicalHistory: validatedData.medicalHistory,
        allergies: validatedData.allergies,
        skinType: validatedData.skinType,
        isActive: validatedData.isActive
      }
    })

    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}