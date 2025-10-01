import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const portfolioSchema = z.object({
  type: z.enum(['eyebrows', 'lips', 'eyeliner']),
  title: z.string().min(1),
  description: z.string().optional(),
  beforeImage: z.string().optional(),
  afterImage: z.string().optional(),
  isPublic: z.boolean().default(true),
  date: z.string().optional()
})

// GET /api/portfolio - Get user's portfolio items
export async function GET(request: NextRequest) {
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

    const portfolioItems = await prisma.portfolio.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({ portfolio: portfolioItems })
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}

// POST /api/portfolio - Create new portfolio item
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
    const validatedData = portfolioSchema.parse(body)

    const portfolioItem = await prisma.portfolio.create({
      data: {
        userId: user.id,
        type: validatedData.type,
        title: validatedData.title,
        description: validatedData.description,
        beforeImage: validatedData.beforeImage,
        afterImage: validatedData.afterImage,
        isPublic: validatedData.isPublic,
        date: validatedData.date ? new Date(validatedData.date) : new Date()
      }
    })

    return NextResponse.json({ portfolio: portfolioItem }, { status: 201 })
  } catch (error) {
    console.error('Error creating portfolio item:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create portfolio item' },
      { status: 500 }
    )
  }
}

