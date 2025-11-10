import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'
import { Stage } from '@prisma/client'

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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireCrmUser(request)
    const contactId = params.id
    const body = await request.json()
    const stage = body?.stage

    if (!contactId || typeof stage !== 'string' || !STAGE_VALUES.includes(stage as Stage)) {
      return NextResponse.json({ error: 'Invalid stage update' }, { status: 400 })
    }

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        stage: stage as Stage,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, contact })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM pipeline stage PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update stage' }, { status: 500 })
  }
}
