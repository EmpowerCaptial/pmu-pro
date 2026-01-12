import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/training/discussions?programId=fundamentals
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')

    if (!programId) {
      return NextResponse.json({ error: 'programId is required' }, { status: 400 })
    }

    const discussions = await prisma.trainingDiscussion.findMany({
      where: {
        programId: programId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ success: true, discussions })
  } catch (error) {
    console.error('Error fetching discussions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch discussions' },
      { status: 500 }
    )
  }
}

// POST /api/training/discussions - Create a new discussion post
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { programId, title, content } = body

    if (!programId || !title || !content) {
      return NextResponse.json(
        { error: 'programId, title, and content are required' },
        { status: 400 }
      )
    }

    if (!title.trim() || !content.trim()) {
      return NextResponse.json(
        { error: 'Title and content cannot be empty' },
        { status: 400 }
      )
    }

    const discussion = await prisma.trainingDiscussion.create({
      data: {
        programId: programId.trim(),
        title: title.trim(),
        content: content.trim(),
        userId: user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        replies: []
      }
    })

    return NextResponse.json({ success: true, discussion })
  } catch (error) {
    console.error('Error creating discussion:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create discussion' },
      { status: 500 }
    )
  }
}

