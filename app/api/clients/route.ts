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

    // For production/demo purposes, return mock data instead of database queries
    const mockClients = [
      {
        id: 'client-1',
        name: 'Sarah Johnson',
        phone: '+1 (555) 123-4567',
        email: 'sarah.johnson@email.com',
        avatarUrl: null,
        dateOfBirth: '1990-05-15',
        emergencyContact: 'John Johnson - (555) 987-6543',
        medicalHistory: 'No known medical conditions',
        allergies: 'None reported',
        skinType: 'Fitzpatrick Type III',
        notes: 'Prefers natural-looking brows',
        createdAt: '2024-01-15T10:30:00Z',
        lastProcedure: null,
        lastAnalysis: null
      },
      {
        id: 'client-2',
        name: 'Emma Rodriguez',
        phone: '+1 (555) 234-5678',
        email: 'emma.rodriguez@email.com',
        avatarUrl: null,
        dateOfBirth: '1988-12-03',
        emergencyContact: 'Maria Rodriguez - (555) 876-5432',
        medicalHistory: 'Diabetes Type 2',
        allergies: 'Latex',
        skinType: 'Fitzpatrick Type IV',
        notes: 'Sensitive skin, prefers gentle techniques',
        createdAt: '2024-01-20T14:20:00Z',
        lastProcedure: null,
        lastAnalysis: null
      },
      {
        id: 'client-3',
        name: 'Lisa Park',
        phone: '+1 (555) 345-6789',
        email: 'lisa.park@email.com',
        avatarUrl: null,
        dateOfBirth: '1992-08-22',
        emergencyContact: 'David Park - (555) 765-4321',
        medicalHistory: 'No known medical conditions',
        allergies: 'None reported',
        skinType: 'Fitzpatrick Type II',
        notes: 'First-time PMU client, very excited',
        createdAt: '2024-01-25T09:15:00Z',
        lastProcedure: null,
        lastAnalysis: null
      }
    ]

    console.log('API: Returning', mockClients.length, 'mock clients')
    return NextResponse.json({ clients: mockClients })

  } catch (error) {
    console.error('API: Unexpected error in clients endpoint:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
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
