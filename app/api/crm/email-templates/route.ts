import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { staffRecord } = await requireCrmUser(request)

    const templates = await prisma.emailTemplate.findMany({
      where: {
        staffId: staffRecord.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      templates
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM email templates GET error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch email templates', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { staffRecord } = await requireCrmUser(request)
    const body = await request.json()
    const { name, subject, body: templateBody } = body

    if (!name || !subject || !templateBody) {
      return NextResponse.json(
        { error: 'Missing required fields: name, subject, and body are required.' },
        { status: 400 }
      )
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        body: templateBody,
        staffId: staffRecord.id
      }
    })

    return NextResponse.json({
      template
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM email templates POST error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to create email template', details: errorMessage },
      { status: 500 }
    )
  }
}

