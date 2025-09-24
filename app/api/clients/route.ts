import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Get user email from headers (sent by the frontend)
    const userEmail = request.headers.get('x-user-email')
    
    console.log('API: Received user email:', userEmail)
    
    if (!userEmail) {
      console.log('API: No user email provided, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Connect to database
    await prisma.$connect()
    console.log('API: Database connected')

    // Try to find the user
    console.log('API: Querying user by email:', userEmail)
    let user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      console.log('API: User not found for email:', userEmail)
      // Create a new user if they don't exist (for demo purposes)
      try {
        user = await prisma.user.create({
          data: {
            name: userEmail.split('@')[0],
            email: userEmail,
            password: 'demo_password', // This is just for demo
            businessName: 'Demo Business',
            licenseNumber: 'DEMO123',
            licenseState: 'CA',
            role: 'artist'
          }
        })
        console.log('API: Created new user:', { id: user.id, email: user.email })
      } catch (createError) {
        console.log('API: Failed to create user:', createError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }
    }
    
    console.log('API: User found/created:', { id: user.id, email: user.email })

    // Fetch clients for this user
    const clients = await prisma.client.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      orderBy: { name: 'asc' }
    })

    // Transform the data to match the ClientList component interface
    const transformedClients = clients.map(client => ({
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      avatarUrl: null,
      dateOfBirth: client.dateOfBirth,
      emergencyContact: client.emergencyContact,
      medicalHistory: client.medicalHistory,
      allergies: client.allergies,
      skinType: client.skinType,
      notes: client.notes,
      createdAt: client.createdAt,
      lastProcedure: null,
      lastAnalysis: null
    }))

    console.log('API: Returning', transformedClients.length, 'clients')
    return NextResponse.json({ clients: transformedClients })

  } catch (error) {
    console.error('API: Unexpected error in clients endpoint:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch clients',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      console.log('API POST: User not found for email:', userEmail)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, dateOfBirth, emergencyContact, medicalHistory, allergies, skinType, notes } = body

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
