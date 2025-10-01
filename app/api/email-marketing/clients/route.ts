import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const userEmail = request.headers.get('x-user-email')

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Find user or create demo user
    let user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      // Create demo user if not found
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: 'Demo User',
          password: 'demo',
          businessName: 'Demo PMU Studio',
          phone: '',
          licenseNumber: '',
          licenseState: '',
          yearsExperience: '',
          selectedPlan: 'demo',
          hasActiveSubscription: false,
          isLicenseVerified: false,
          role: 'artist',
          subscriptionStatus: 'demo'
        }
      })
    }

    // Build where clause for filtering
    const whereClause: any = {
      userId: user.id
    }

    // Add search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Add status filter
    if (status !== 'all') {
      whereClause.status = status
    }

    // Get clients with their latest appointment
    let clients = await prisma.client.findMany({
      where: whereClause,
      include: {
        appointments: {
          orderBy: { startTime: 'desc' },
          take: 1,
          select: {
            startTime: true,
            status: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // If no clients exist, create some sample clients for demo
    if (clients.length === 0) {
      const sampleClients = [
        {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '(555) 123-4567',
          userId: user.id
        },
        {
          name: 'Emily Davis',
          email: 'emily.davis@email.com',
          phone: '(555) 234-5678',
          userId: user.id
        },
        {
          name: 'Jessica Brown',
          email: 'jessica.brown@email.com',
          phone: '(555) 345-6789',
          userId: user.id
        },
        {
          name: 'Amanda Wilson',
          email: 'amanda.wilson@email.com',
          phone: '(555) 456-7890',
          userId: user.id
        },
        {
          name: 'Michelle Taylor',
          email: 'michelle.taylor@email.com',
          phone: '(555) 567-8901',
          userId: user.id
        }
      ]

      // Create sample clients
      for (const clientData of sampleClients) {
        await prisma.client.create({
          data: clientData
        })
      }

      // Fetch the newly created clients
      clients = await prisma.client.findMany({
        where: whereClause,
        include: {
          appointments: {
            orderBy: { startTime: 'desc' },
            take: 1,
            select: {
              startTime: true,
              status: true
            }
          }
        },
        orderBy: { name: 'asc' }
      })
    }

    // Transform data for email marketing
    const emailClients = clients.map(client => {
      const lastAppointment = client.appointments[0]
      const lastVisit = lastAppointment?.startTime 
        ? new Date(lastAppointment.startTime).toISOString().split('T')[0]
        : null
      
      // Determine client status based on last visit
      let clientStatus = 'inactive'
      if (lastVisit) {
        const daysSinceLastVisit = Math.floor(
          (Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysSinceLastVisit <= 90) {
          clientStatus = 'active'
        } else if (daysSinceLastVisit <= 180) {
          clientStatus = 'inactive'
        } else {
          clientStatus = 'inactive'
        }
      }

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        lastVisit,
        status: clientStatus,
        totalAppointments: client.appointments?.length || 0,
        lastAppointmentStatus: lastAppointment?.status || null
      }
    })

    // Get statistics
    const stats = {
      total: emailClients.length,
      active: emailClients.filter(c => c.status === 'active').length,
      inactive: emailClients.filter(c => c.status === 'inactive').length,
      withEmail: emailClients.filter(c => c.email && c.email.trim() !== '').length,
      withoutEmail: emailClients.filter(c => !c.email || c.email.trim() === '').length
    }

    return NextResponse.json({
      success: true,
      clients: emailClients,
      stats
    })

  } catch (error) {
    console.error('Error fetching clients for email marketing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientIds, campaignData, emailContent } = body
    const userEmail = request.headers.get('x-user-email')

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return NextResponse.json({ error: 'Client IDs required' }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get selected clients
    const clients = await prisma.client.findMany({
      where: {
        id: { in: clientIds },
        userId: user.id
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    // Filter clients with valid email addresses
    const validClients = clients.filter(client => 
      client.email && client.email.trim() !== ''
    )

    if (validClients.length === 0) {
      return NextResponse.json({ 
        error: 'No clients with valid email addresses found' 
      }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Save the campaign to a campaigns table
    // 2. Queue emails for sending via email service (SendGrid, Mailgun, etc.)
    // 3. Track email delivery and open rates
    
    // For now, we'll simulate the email sending process
    const emailResults = validClients.map(client => ({
      clientId: client.id,
      clientName: client.name,
      email: client.email,
      status: 'queued', // queued, sent, failed, bounced
      sentAt: new Date().toISOString()
    }))

    // Create campaign record (you would need to add a campaigns table to your schema)
    const campaign = {
      id: `campaign_${Date.now()}`,
      userId: user.id,
      type: campaignData.campaignType,
      subject: campaignData.subject,
      content: emailContent,
      recipientCount: validClients.length,
      status: 'sent',
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: `Email campaign sent to ${validClients.length} clients`,
      campaign,
      results: emailResults,
      stats: {
        total: clientIds.length,
        valid: validClients.length,
        invalid: clientIds.length - validClients.length
      }
    })

  } catch (error) {
    console.error('Error sending email campaign:', error)
    return NextResponse.json(
      { error: 'Failed to send email campaign' },
      { status: 500 }
    )
  }
}
