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
