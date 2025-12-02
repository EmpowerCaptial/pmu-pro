import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireCrmUser(request)
    const contactId = params.id

    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 })
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        owner: true,
        tasks: {
          orderBy: { createdAt: 'desc' },
          include: {
            owner: true,
            contact: { select: { id: true, firstName: true, lastName: true } }
          }
        },
        tours: {
          orderBy: { start: 'desc' },
          include: {
            staff: true
          }
        },
        applications: {
          orderBy: { createdAt: 'desc' }
        },
        enrollments: {
          orderBy: { createdAt: 'desc' }
        },
        consents: {
          orderBy: { timestamp: 'desc' }
        },
        interactions: {
          orderBy: { createdAt: 'desc' },
          include: {
            staff: true
          }
        }
      }
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json({ contact })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM contact detail GET error:', error)
    return NextResponse.json({ error: 'Failed to load contact' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireCrmUser(request)
    const contactId = params.id
    const body = await request.json()

    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 })
    }

    const { firstName, lastName, email, phone, source, stage } = body

    // Validate required fields
    if (firstName !== undefined && !firstName?.trim()) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 })
    }
    if (lastName !== undefined && !lastName?.trim()) {
      return NextResponse.json({ error: 'Last name is required' }, { status: 400 })
    }

    // Validate email format if provided
    if (email !== undefined && email !== null && email !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }
    }

    // Validate stage if provided
    const validStages = ['LEAD', 'TOUR_SCHEDULED', 'TOURED', 'APP_STARTED', 'APP_SUBMITTED', 'ENROLLED', 'NO_SHOW', 'NURTURE']
    if (stage !== undefined && !validStages.includes(stage)) {
      return NextResponse.json({ error: 'Invalid stage value' }, { status: 400 })
    }

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        ...(firstName !== undefined && { firstName: firstName.trim() }),
        ...(lastName !== undefined && { lastName: lastName.trim() }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(source !== undefined && { source: source?.trim() || null }),
        ...(stage !== undefined && { stage: stage as any }),
        updatedAt: new Date()
      },
      include: {
        owner: true,
        tasks: {
          orderBy: { createdAt: 'desc' },
          include: {
            owner: true,
            contact: { select: { id: true, firstName: true, lastName: true } }
          }
        },
        tours: {
          orderBy: { start: 'desc' },
          include: {
            staff: true
          }
        },
        applications: {
          orderBy: { createdAt: 'desc' }
        },
        enrollments: {
          orderBy: { createdAt: 'desc' }
        },
        consents: {
          orderBy: { timestamp: 'desc' }
        },
        interactions: {
          orderBy: { createdAt: 'desc' },
          include: {
            staff: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, contact })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM contact PATCH error:', error)
    
    // Handle unique constraint violation (e.g., duplicate email)
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Email already exists for another contact' }, { status: 400 })
      }
    }
    
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}
