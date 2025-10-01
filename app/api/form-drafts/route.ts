import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const formDraftSchema = z.object({
  formType: z.enum(['client_intake', 'consent_form', 'credit_application', 'artist_signup', 'skin_analysis']),
  formData: z.record(z.any()),
  isComplete: z.boolean().default(false),
  clientId: z.string().optional()
})

// GET /api/form-drafts - Get user's form drafts
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const formType = searchParams.get('formType')
    const clientId = searchParams.get('clientId')

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const whereClause: any = {
      userId: user.id
    }

    if (formType) {
      whereClause.formType = formType
    }

    if (clientId) {
      whereClause.clientId = clientId
    }

    const drafts = await prisma.formDraft.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' }
    })

    // Parse formData from JSON string
    const parsedDrafts = drafts.map(draft => ({
      ...draft,
      formData: JSON.parse(draft.formData)
    }))

    return NextResponse.json({ drafts: parsedDrafts })
  } catch (error) {
    console.error('Error fetching form drafts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch form drafts' },
      { status: 500 }
    )
  }
}

// POST /api/form-drafts - Create or update form draft
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = formDraftSchema.parse(body)

    // Check if draft already exists
    const existingDraft = await prisma.formDraft.findFirst({
      where: {
        userId: user.id,
        formType: validatedData.formType,
        clientId: validatedData.clientId || null
      }
    })

    let draft
    if (existingDraft) {
      // Update existing draft
      draft = await prisma.formDraft.update({
        where: { id: existingDraft.id },
        data: {
          formData: JSON.stringify(validatedData.formData),
          isComplete: validatedData.isComplete,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new draft
      draft = await prisma.formDraft.create({
        data: {
          userId: user.id,
          clientId: validatedData.clientId,
          formType: validatedData.formType,
          formData: JSON.stringify(validatedData.formData),
          isComplete: validatedData.isComplete
        }
      })
    }

    // Parse formData from JSON string for response
    const responseDraft = {
      ...draft,
      formData: JSON.parse(draft.formData)
    }

    return NextResponse.json({ draft: responseDraft }, { status: existingDraft ? 200 : 201 })
  } catch (error) {
    console.error('Error saving form draft:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to save form draft' },
      { status: 500 }
    )
  }
}

// DELETE /api/form-drafts - Delete form draft
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const draftId = searchParams.get('id')
    const formType = searchParams.get('formType')
    const clientId = searchParams.get('clientId')

    if (!draftId && !formType) {
      return NextResponse.json({ error: 'Draft ID or form type required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const whereClause: any = {
      userId: user.id
    }

    if (draftId) {
      whereClause.id = draftId
    } else {
      whereClause.formType = formType
      if (clientId) {
        whereClause.clientId = clientId
      }
    }

    await prisma.formDraft.deleteMany({
      where: whereClause
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting form draft:', error)
    return NextResponse.json(
      { error: 'Failed to delete form draft' },
      { status: 500 }
    )
  }
}
