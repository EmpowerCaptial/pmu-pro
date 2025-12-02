import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify the template belongs to this staff member
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { id: params.id }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found.' },
        { status: 404 }
      )
    }

    if (existingTemplate.staffId !== staffRecord.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You can only edit your own templates.' },
        { status: 403 }
      )
    }

    const template = await prisma.emailTemplate.update({
      where: { id: params.id },
      data: {
        name,
        subject,
        body: templateBody
      }
    })

    return NextResponse.json({
      template
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM email templates PATCH error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to update email template', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { staffRecord } = await requireCrmUser(request)

    // Verify the template belongs to this staff member
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { id: params.id }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found.' },
        { status: 404 }
      )
    }

    if (existingTemplate.staffId !== staffRecord.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You can only delete your own templates.' },
        { status: 403 }
      )
    }

    await prisma.emailTemplate.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM email templates DELETE error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to delete email template', details: errorMessage },
      { status: 500 }
    )
  }
}

