import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get user email from headers (sent by the frontend)
    const userEmail = request.headers.get('x-user-email')
    
    console.log('API: Received user email:', userEmail);
    console.log('API: All headers:', Object.fromEntries(request.headers.entries()));
    
    if (!userEmail) {
      console.log('API: No user email provided, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch clients for this user
    const clients = await prisma.client.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      include: {
        procedures: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Get the most recent procedure
        },
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Get the most recent analysis
        }
      },
      orderBy: { name: 'asc' }
    })

    // Transform the data to match the ClientList component interface
    const transformedClients = clients.map(client => ({
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      avatarUrl: null, // We'll add avatar support later
      // Additional client data for enhanced functionality
      dateOfBirth: client.dateOfBirth,
      emergencyContact: client.emergencyContact,
      medicalHistory: client.medicalHistory,
      allergies: client.allergies,
      skinType: client.skinType,
      notes: client.notes,
      createdAt: client.createdAt,
      lastProcedure: client.procedures[0] || null,
      lastAnalysis: client.analyses[0] || null
    }))

    return NextResponse.json({ clients: transformedClients })

  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user email from headers (sent by the frontend)
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, email, phone, dateOfBirth, emergencyContact, medicalHistory, allergies, skinType, notes } = body

    // Create new client
    const client = await prisma.client.create({
      data: {
        userId: user.id,
        name,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        emergencyContact,
        medicalHistory,
        allergies,
        skinType,
        notes
      }
    })

    return NextResponse.json({ client }, { status: 201 })

  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}
