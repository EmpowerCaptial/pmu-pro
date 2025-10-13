import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = "force-dynamic"

const reviewLinkSchema = z.object({
  name: z.string().min(1),
  service: z.string().min(1),
  platform: z.enum(['google', 'facebook', 'yelp', 'website']).default('website')
})

// GET /api/review-links - Get user's review links
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true, businessName: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const reviewLinks = await prisma.reviewLink.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Format response to match frontend expectations
    const formattedLinks = reviewLinks.map(link => ({
      id: link.id,
      name: link.name,
      url: link.url,
      service: link.service,
      sentTo: link.sentTo,
      responses: link.responses,
      createdAt: link.createdAt.toISOString(),
      isActive: link.isActive
    }))

    return NextResponse.json({ reviewLinks: formattedLinks })

  } catch (error) {
    console.error('Error fetching review links:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review links', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/review-links - Create a new review link
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true, businessName: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = reviewLinkSchema.parse(body)

    // Generate unique review link URL
    const randomString = Math.random().toString(36).substring(2, 11)
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'}/review/${randomString}`

    const reviewLink = await prisma.reviewLink.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        url,
        service: validatedData.service,
        sentTo: 0,
        responses: 0,
        isActive: true
      }
    })

    return NextResponse.json({ 
      reviewLink: {
        id: reviewLink.id,
        name: reviewLink.name,
        url: reviewLink.url,
        service: reviewLink.service,
        sentTo: reviewLink.sentTo,
        responses: reviewLink.responses,
        createdAt: reviewLink.createdAt.toISOString(),
        isActive: reviewLink.isActive
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid review link data', details: error.errors }, { status: 400 })
    }
    
    console.error('Error creating review link:', error)
    return NextResponse.json(
      { error: 'Failed to create review link', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT /api/review-links - Update a review link
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { linkId, isActive } = body

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 })
    }

    // Verify ownership
    const existingLink = await prisma.reviewLink.findUnique({
      where: { id: linkId }
    })

    if (!existingLink || existingLink.userId !== user.id) {
      return NextResponse.json({ error: 'Review link not found or access denied' }, { status: 404 })
    }

    const reviewLink = await prisma.reviewLink.update({
      where: { id: linkId },
      data: { isActive: isActive ?? existingLink.isActive }
    })

    return NextResponse.json({ 
      reviewLink: {
        id: reviewLink.id,
        name: reviewLink.name,
        url: reviewLink.url,
        service: reviewLink.service,
        sentTo: reviewLink.sentTo,
        responses: reviewLink.responses,
        createdAt: reviewLink.createdAt.toISOString(),
        isActive: reviewLink.isActive
      }
    })

  } catch (error) {
    console.error('Error updating review link:', error)
    return NextResponse.json(
      { error: 'Failed to update review link', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE /api/review-links - Delete a review link
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('id')

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 })
    }

    // Verify ownership
    const existingLink = await prisma.reviewLink.findUnique({
      where: { id: linkId }
    })

    if (!existingLink || existingLink.userId !== user.id) {
      return NextResponse.json({ error: 'Review link not found or access denied' }, { status: 404 })
    }

    await prisma.reviewLink.delete({
      where: { id: linkId }
    })

    return NextResponse.json({ success: true, message: 'Review link deleted' })

  } catch (error) {
    console.error('Error deleting review link:', error)
    return NextResponse.json(
      { error: 'Failed to delete review link', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

