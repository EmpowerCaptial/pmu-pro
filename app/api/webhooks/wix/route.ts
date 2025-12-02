import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * Wix Webhook Endpoint for Creating CRM Contacts
 * 
 * This endpoint accepts form submissions from Wix and creates contacts in the CRM.
 * 
 * Authentication: Uses WEBHOOK_SECRET environment variable
 * 
 * Required Body Parameters:
 * - firstName: string (required)
 * - lastName: string (required)
 * - email: string (optional, but either email or phone required)
 * - phone: string (optional, but either email or phone required)
 * 
 * Optional Body Parameters:
 * - source: string (defaults to "Wix")
 * - tags: string[] (array of tags)
 * - ownerEmail: string (email of staff member to assign contact to)
 * - notes: string (additional notes)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization')
    const webhookSecret = process.env.WEBHOOK_SECRET || process.env.WIX_WEBHOOK_SECRET
    
    if (!webhookSecret) {
      console.error('WEBHOOK_SECRET or WIX_WEBHOOK_SECRET environment variable not set')
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      )
    }

    // Check for Bearer token or custom header
    const providedSecret = 
      authHeader?.startsWith('Bearer ') 
        ? authHeader.replace('Bearer ', '')
        : request.headers.get('x-webhook-secret')

    if (providedSecret !== webhookSecret) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid webhook secret' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      source, 
      tags, 
      ownerEmail,
      notes 
    } = body

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      )
    }

    // Normalize email: convert empty string to null
    const normalizedEmail = email && email.trim() !== '' ? email.trim().toLowerCase() : null
    
    // Normalize phone: convert empty string to null
    const normalizedPhone = phone && phone.trim() !== '' ? phone.trim() : null

    // Require at least one contact method (email OR phone)
    if (!normalizedEmail && !normalizedPhone) {
      return NextResponse.json(
        { error: 'Either email or phone number is required to create a contact' },
        { status: 400 }
      )
    }

    // Check for duplicate email only if email is provided
    if (normalizedEmail) {
      const existingContact = await prisma.contact.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, firstName: true, lastName: true }
      })

      if (existingContact) {
        return NextResponse.json(
          {
            error: `A contact with this email already exists: ${existingContact.firstName} ${existingContact.lastName}`,
            code: 'duplicate_contact',
            existingContactId: existingContact.id
          },
          { status: 409 }
        )
      }
    }

    // Check for duplicate phone if phone is provided and no email
    if (normalizedPhone && !normalizedEmail) {
      const existingContact = await prisma.contact.findFirst({
        where: {
          phone: normalizedPhone,
          email: null
        },
        select: { id: true, firstName: true, lastName: true }
      })

      if (existingContact) {
        return NextResponse.json(
          {
            error: `A contact with this phone number already exists: ${existingContact.firstName} ${existingContact.lastName}`,
            code: 'duplicate_contact',
            existingContactId: existingContact.id
          },
          { status: 409 }
        )
      }
    }

    // Find or create staff record for owner assignment
    let ownerId: string | null = null

    if (ownerEmail) {
      // Find staff by email
      const ownerStaff = await prisma.staff.findUnique({
        where: { email: ownerEmail.toLowerCase() }
      })

      if (ownerStaff) {
        ownerId = ownerStaff.id
      } else {
        // Try to find user and create staff record
        const ownerUser = await prisma.user.findUnique({
          where: { email: ownerEmail.toLowerCase() }
        })

        if (ownerUser) {
          const normalizedRole = ownerUser.role?.toLowerCase() ?? 'staff'
          const newStaff = await prisma.staff.upsert({
            where: { email: ownerUser.email },
            update: {
              name: ownerUser.name ?? ownerUser.email,
              role: normalizedRole,
              phone: ownerUser.phone ?? undefined
            },
            create: {
              email: ownerUser.email,
              name: ownerUser.name ?? ownerUser.email,
              role: normalizedRole,
              phone: ownerUser.phone ?? undefined
            }
          })
          ownerId = newStaff.id
        }
      }
    } else {
      // Find first available owner/staff member as default
      const defaultOwner = await prisma.staff.findFirst({
        where: {
          role: {
            in: ['owner', 'manager', 'director']
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      if (defaultOwner) {
        ownerId = defaultOwner.id
      }
    }

    // Prepare tags array
    const contactTags = Array.isArray(tags) 
      ? [...tags, 'Wix'] 
      : ['Wix']

    // Create contact
    const contact = await prisma.contact.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        source: source?.trim() || 'Wix',
        tags: contactTags,
        ownerId: ownerId,
        stage: 'LEAD'
      }
    })

    // Create interaction record if notes provided
    if (notes && ownerId) {
      await prisma.interaction.create({
        data: {
          contactId: contact.id,
          staffId: ownerId,
          type: 'note',
          direction: 'inbound',
          subject: 'Form Submission from Wix',
          body: notes
        }
      })
    }

    return NextResponse.json({
      success: true,
      contact: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        source: contact.source,
        tags: contact.tags,
        stage: contact.stage
      }
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target) 
          ? error.meta?.target.join(', ') 
          : error.meta?.target
        const targetString = typeof target === 'string' ? target : ''
        const message = targetString.includes('email')
          ? 'A contact with this email already exists'
          : 'This contact already exists'
        return NextResponse.json(
          { error: message, code: 'duplicate_contact' },
          { status: 409 }
        )
      }
      if (error.code === 'P2021') {
        console.error('CRM tables missing:', error)
        return NextResponse.json(
          { error: 'CRM database tables not found. Please run the CRM migrations.' },
          { status: 500 }
        )
      }
    }

    console.error('Wix webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}


