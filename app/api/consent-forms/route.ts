import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/consent-forms - Get user's consent forms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const formType = searchParams.get('formType')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Get user email from headers
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Build where clause for filters
    const where: any = {
      userId: user.id
    }
    
    if (clientId) {
      where.clientId = clientId
    }
    
    if (formType) {
      where.formType = formType
    }
    
    if (status) {
      where.status = status
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }
    
    // Query database
    const forms = await prisma.consentForm.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({
      forms,
      total: forms.length,
      filters: {
        clientId,
        formType,
        status,
        startDate,
        endDate
      }
    })
    
  } catch (error) {
    console.error('Error retrieving consent forms:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve forms', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/consent-forms - Create a new consent form
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { clientId, clientName, formType, sendMethod, contactInfo, customMessage, token } = body

    if (!clientId || !clientName || !formType || !token) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, clientName, formType, token' },
        { status: 400 }
      )
    }

    // Create consent form in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

    const consentForm = await prisma.consentForm.create({
      data: {
        userId: user.id,
        clientId,
        clientName,
        artistEmail: user.email,
        formType,
        sendMethod: sendMethod || 'email',
        contactInfo,
        customMessage,
        token,
        expiresAt,
        status: 'sent',
        sentAt: new Date()
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      form: consentForm 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating consent form:', error)
    return NextResponse.json(
      { error: 'Failed to create consent form', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
