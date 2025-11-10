import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { staffRecord } = await requireCrmUser(request)
    const contactId = params.id
    const body = await request.json()
    const { type, direction, subject, body: messageBody } = body

    if (!contactId || !type || !direction) {
      return NextResponse.json({ error: 'Type, direction, and contact are required.' }, { status: 400 })
    }

    const interaction = await prisma.interaction.create({
      data: {
        contactId,
        staffId: staffRecord.id,
        type,
        direction,
        subject,
        body: messageBody
      }
    })

    return NextResponse.json({ success: true, interaction })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM interaction POST error:', error)
    return NextResponse.json({ error: 'Failed to create interaction' }, { status: 500 })
  }
}
