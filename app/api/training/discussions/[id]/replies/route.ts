import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// POST /api/training/discussions/[id]/replies - Create a reply to a discussion
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const discussionId = params.id
    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Verify discussion exists
    const discussion = await prisma.trainingDiscussion.findUnique({
      where: { id: discussionId }
    })

    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      )
    }

    const reply = await prisma.trainingDiscussionReply.create({
      data: {
        discussionId,
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
        }
      }
    })

    return NextResponse.json({ success: true, reply })
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create reply' },
      { status: 500 }
    )
  }
}

