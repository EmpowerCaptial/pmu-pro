import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = "force-dynamic"

const reviewSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email().optional(),
  clientId: z.string().optional(),
  service: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  platform: z.enum(['google', 'facebook', 'yelp', 'website']).default('website'),
  reviewLinkId: z.string().optional()
})

const updateReviewSchema = z.object({
  status: z.enum(['pending', 'published', 'hidden']).optional(),
  comment: z.string().optional(),
  rating: z.number().min(1).max(5).optional()
})

// GET /api/reviews - Get user's reviews
export async function GET(request: NextRequest) {
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

    const reviews = await prisma.review.findMany({
      where: { userId: user.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviewLink: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stats
    const totalReviews = reviews.length
    const publishedReviews = reviews.filter(r => r.status === 'published').length
    const pendingReviews = reviews.filter(r => r.status === 'pending').length
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0

    return NextResponse.json({
      reviews,
      stats: {
        total: totalReviews,
        published: publishedReviews,
        pending: pendingReviews,
        averageRating: parseFloat(averageRating.toFixed(1))
      }
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
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
    const validatedData = reviewSchema.parse(body)

    // Auto-publish reviews with 4-5 stars
    const status = validatedData.rating >= 4 ? 'published' : 'pending'
    const publishedAt = validatedData.rating >= 4 ? new Date() : null

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        clientName: validatedData.clientName,
        clientEmail: validatedData.clientEmail,
        clientId: validatedData.clientId,
        service: validatedData.service,
        rating: validatedData.rating,
        comment: validatedData.comment,
        platform: validatedData.platform,
        reviewLinkId: validatedData.reviewLinkId,
        status,
        publishedAt
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Update review link response count if applicable
    if (validatedData.reviewLinkId) {
      await prisma.reviewLink.update({
        where: { id: validatedData.reviewLinkId },
        data: { responses: { increment: 1 } }
      })
    }

    return NextResponse.json({ review }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid review data', details: error.errors }, { status: 400 })
    }
    
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT /api/reviews - Update a review
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
    const { reviewId, ...updateData } = body
    
    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 })
    }

    const validatedData = updateReviewSchema.parse(updateData)

    // Verify ownership
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!existingReview || existingReview.userId !== user.id) {
      return NextResponse.json({ error: 'Review not found or access denied' }, { status: 404 })
    }

    // Update publishedAt when status changes to published
    const updatePayload: any = { ...validatedData }
    if (validatedData.status === 'published' && !existingReview.publishedAt) {
      updatePayload.publishedAt = new Date()
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: updatePayload,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ review })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid update data', details: error.errors }, { status: 400 })
    }
    
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews - Delete a review
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
    const reviewId = searchParams.get('id')

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 })
    }

    // Verify ownership
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!existingReview || existingReview.userId !== user.id) {
      return NextResponse.json({ error: 'Review not found or access denied' }, { status: 404 })
    }

    await prisma.review.delete({
      where: { id: reviewId }
    })

    return NextResponse.json({ success: true, message: 'Review deleted' })

  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

