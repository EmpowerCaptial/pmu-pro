import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, Stage } from '@prisma/client'
import { requireCrmUser } from '@/lib/server/crm-auth'

const STAGE_VALUES = [
  Stage.LEAD,
  Stage.TOUR_SCHEDULED,
  Stage.TOURED,
  Stage.APP_STARTED,
  Stage.APP_SUBMITTED,
  Stage.ENROLLED,
  Stage.NO_SHOW,
  Stage.NURTURE
]

const CRM_MISSING_TABLE_MESSAGE = 'CRM database tables not found. Please run the CRM migrations.'

const isMissingCrmTable = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021'

const STAGE_ORDER = [
  'LEAD',
  'TOUR_SCHEDULED',
  'TOURED',
  'APP_STARTED',
  'APP_SUBMITTED',
  'ENROLLED',
  'NO_SHOW',
  'NURTURE'
] as const

export async function GET(request: NextRequest) {
  try {
    await requireCrmUser(request)

    const contacts = await prisma.contact.findMany({
      include: {
        owner: true,
        tasks: {
          where: { status: { not: 'DONE' } },
          select: { id: true, title: true, dueAt: true, status: true }
        },
        tours: {
          orderBy: { start: 'asc' },
          take: 1,
          select: { id: true, start: true, status: true, location: true }
        },
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            type: true,
            direction: true,
            subject: true,
            createdAt: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    const columns = STAGE_ORDER.map(stage => ({
      stage,
      contacts: contacts
        .filter(contact => contact.stage === stage)
        .map(contact => ({
          id: contact.id,
          name: `${contact.firstName} ${contact.lastName}`.trim(),
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          source: contact.source,
          tags: contact.tags,
          owner: contact.owner ? {
            id: contact.owner.id,
            name: contact.owner.name,
            email: contact.owner.email
          } : null,
          stage: contact.stage,
          score: contact.score,
          lastInteraction: contact.interactions[0] || null,
          nextTour: contact.tours[0] || null,
          openTasks: contact.tasks
        }))
    }))

    const stageCounts = columns.reduce<Record<string, number>>((acc, column) => {
      acc[column.stage] = column.contacts.length
      return acc
    }, {})

    return NextResponse.json({
      totals: {
        totalContacts: contacts.length,
        stageCounts
      },
      columns
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    if (isMissingCrmTable(error)) {
      console.error('CRM pipeline GET missing tables:', error)
      return NextResponse.json({ error: CRM_MISSING_TABLE_MESSAGE }, { status: 500 })
    }
    console.error('CRM pipeline GET error:', error)
    return NextResponse.json({ error: 'Failed to load pipeline' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { staffRecord } = await requireCrmUser(request)
    const body = await request.json()
    let { firstName, lastName, email, phone, source, tags } = body

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First and last name are required.' }, { status: 400 })
    }

    // Normalize email: convert empty string to null
    const normalizedEmail = email && email.trim() !== '' ? email.trim() : null
    
    // Normalize phone: convert empty string to null
    const normalizedPhone = phone && phone.trim() !== '' ? phone.trim() : null

    // Require at least one contact method (email OR phone)
    if (!normalizedEmail && !normalizedPhone) {
      return NextResponse.json({ 
        error: 'Either email or phone number is required to create a contact.' 
      }, { status: 400 })
    }

    // Check for duplicate email only if email is provided
    if (normalizedEmail) {
      const existingContact = await prisma.contact.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, firstName: true, lastName: true }
      })

      if (existingContact) {
        return NextResponse.json({ 
          error: `A contact with this email already exists: ${existingContact.firstName} ${existingContact.lastName}. Add a different email or update the existing record.`,
          code: 'duplicate_contact',
          existingContactId: existingContact.id
        }, { status: 409 })
      }
    }

    // Check for duplicate phone if phone is provided and no email
    if (normalizedPhone && !normalizedEmail) {
      const existingContact = await prisma.contact.findFirst({
        where: { 
          phone: normalizedPhone,
          email: null // Only check if no email exists
        },
        select: { id: true, firstName: true, lastName: true }
      })

      if (existingContact) {
        return NextResponse.json({ 
          error: `A contact with this phone number already exists: ${existingContact.firstName} ${existingContact.lastName}. Add a different phone number or update the existing record.`,
          code: 'duplicate_contact',
          existingContactId: existingContact.id
        }, { status: 409 })
      }
    }

    const contact = await prisma.contact.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        source: source?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        ownerId: staffRecord.id
      }
    })

    return NextResponse.json({ success: true, contact })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target) ? error.meta?.target.join(', ') : error.meta?.target
        const targetString = typeof target === 'string' ? target : ''
        const message = targetString.includes('email')
          ? 'A contact with this email already exists. Add a different email or update the existing record.'
          : 'This contact already exists.'
        return NextResponse.json({ error: message, code: 'duplicate_contact' }, { status: 409 })
      }
      if (isMissingCrmTable(error)) {
        console.error('CRM pipeline POST missing tables:', error)
        return NextResponse.json({ error: CRM_MISSING_TABLE_MESSAGE }, { status: 500 })
      }
    }

    console.error('CRM pipeline POST error:', error)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}
