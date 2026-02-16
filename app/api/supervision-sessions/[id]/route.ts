import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// PATCH /api/supervision-sessions/[id] - Update status (e.g. completed, cancelled)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true }
    })
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const { status, depositLink, depositSent } = body

    const existing = await prisma.supervisionSession.findUnique({
      where: { id }
    })
    if (!existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Only instructor or student who owns the session can update
    if (existing.instructorId !== currentUser.id && existing.studentId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updateData: { status?: string; depositLink?: string; depositSent?: boolean } = {}
    if (typeof status === 'string') updateData.status = status
    if (depositLink !== undefined) updateData.depositLink = depositLink
    if (depositSent !== undefined) updateData.depositSent = depositSent

    const updated = await prisma.supervisionSession.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, session: updated })
  } catch (error) {
    console.error('Supervision session PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}
