import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/financial/staff-earnings - Get earnings for staff member
export async function GET(request: NextRequest) {
  try {
    const staffEmail = request.headers.get('x-user-email')
    
    if (!staffEmail) {
      return NextResponse.json({ error: 'Email required' }, { status: 401 })
    }

    const staff = await prisma.user.findUnique({
      where: { email: staffEmail },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employmentType: true,
        commissionRate: true,
        boothRentAmount: true,
        studioName: true
      }
    })

    if (!staff) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all commission transactions for this staff member
    const transactions = await prisma.commissionTransaction.findMany({
      where: {
        staffId: staff.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate totals
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)
    const commissionEarned = transactions.reduce((sum, t) => sum + t.commissionAmount, 0)
    const commissionPaid = transactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.commissionAmount, 0)
    const commissionPending = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.commissionAmount, 0)
    const ownerShare = transactions.reduce((sum, t) => sum + t.ownerAmount, 0)

    return NextResponse.json({
      success: true,
      earnings: {
        employmentType: staff.employmentType,
        commissionRate: staff.commissionRate || 0,
        boothRentAmount: staff.boothRentAmount,
        totalRevenue,
        commissionEarned,
        commissionPaid,
        commissionPending,
        ownerShare,
        transactionCount: transactions.length
      }
    })

  } catch (error: any) {
    console.error('Error fetching staff earnings:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch earnings',
        details: error.message
      },
      { status: 500 }
    )
  }
}

