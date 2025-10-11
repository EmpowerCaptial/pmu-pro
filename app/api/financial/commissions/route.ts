import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/financial/commissions - Get commission summary for owner
export async function GET(request: NextRequest) {
  try {
    const ownerEmail = request.headers.get('x-user-email')
    
    if (!ownerEmail) {
      return NextResponse.json({ error: 'Owner email required' }, { status: 401 })
    }

    const owner = await prisma.user.findUnique({
      where: { email: ownerEmail },
      select: {
        id: true,
        role: true,
        studioName: true
      }
    })

    if (!owner || owner.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized - Owner only' }, { status: 403 })
    }

    // Get date range (default to current week)
    const range = request.nextUrl.searchParams.get('range') || 'week'
    const now = new Date()
    let startDate = new Date()
    
    if (range === 'week') {
      const dayOfWeek = now.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      startDate.setDate(now.getDate() - daysToMonday)
      startDate.setHours(0, 0, 0, 0)
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (range === 'all') {
      startDate = new Date(2020, 0, 1) // All time
    }

    // Get all commission transactions for this owner
    const transactions = await prisma.commissionTransaction.findMany({
      where: {
        ownerId: owner.id,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get staff details
    const staffIds = [...new Set(transactions.map(t => t.staffId))]
    const staffMembers = await prisma.user.findMany({
      where: {
        id: { in: staffIds }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employmentType: true
      }
    })

    // Group by staff member
    const commissionsByStaff = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.staffId]) {
        const staff = staffMembers.find(s => s.id === transaction.staffId)
        acc[transaction.staffId] = {
          staffId: transaction.staffId,
          staffName: staff?.name || 'Unknown',
          staffEmail: staff?.email || '',
          staffRole: staff?.role || 'unknown',
          employmentType: staff?.employmentType || 'commissioned',
          totalRevenue: 0,
          totalCommissionOwed: 0,
          totalPaid: 0,
          totalPending: 0,
          transactionCount: 0,
          transactions: []
        }
      }
      
      acc[transaction.staffId].totalRevenue += transaction.amount
      acc[transaction.staffId].totalCommissionOwed += transaction.commissionAmount
      acc[transaction.staffId].transactionCount += 1
      
      if (transaction.status === 'paid') {
        acc[transaction.staffId].totalPaid += transaction.commissionAmount
      } else if (transaction.status === 'pending') {
        acc[transaction.staffId].totalPending += transaction.commissionAmount
      }
      
      acc[transaction.staffId].transactions.push({
        id: transaction.id,
        amount: transaction.amount,
        commissionAmount: transaction.commissionAmount,
        commissionRate: transaction.commissionRate,
        status: transaction.status,
        createdAt: transaction.createdAt.toISOString(),
        paidAt: transaction.paidAt?.toISOString() || null,
        notes: transaction.notes
      })
      
      return acc
    }, {} as Record<string, any>)

    // Calculate totals
    const summary = {
      totalRevenue: transactions.reduce((sum, t) => sum + t.amount, 0),
      totalCommissionOwed: transactions.reduce((sum, t) => sum + t.commissionAmount, 0),
      totalOwnerKeeps: transactions.reduce((sum, t) => sum + t.ownerAmount, 0),
      totalPaid: transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.commissionAmount, 0),
      totalPending: transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.commissionAmount, 0),
      transactionCount: transactions.length,
      staffCount: Object.keys(commissionsByStaff).length
    }

    return NextResponse.json({
      success: true,
      summary,
      byStaff: Object.values(commissionsByStaff),
      range,
      startDate: startDate.toISOString()
    })

  } catch (error: any) {
    console.error('Error fetching commissions:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch commissions',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// POST /api/financial/commissions - Mark commission as paid
export async function POST(request: NextRequest) {
  try {
    const ownerEmail = request.headers.get('x-user-email')
    
    if (!ownerEmail) {
      return NextResponse.json({ error: 'Owner email required' }, { status: 401 })
    }

    const owner = await prisma.user.findUnique({
      where: { email: ownerEmail },
      select: {
        id: true,
        role: true
      }
    })

    if (!owner || owner.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized - Owner only' }, { status: 403 })
    }

    const { transactionIds, paidMethod, notes } = await request.json()

    if (!transactionIds || !Array.isArray(transactionIds)) {
      return NextResponse.json({ error: 'Transaction IDs required' }, { status: 400 })
    }

    // Mark transactions as paid
    await prisma.commissionTransaction.updateMany({
      where: {
        id: { in: transactionIds },
        ownerId: owner.id
      },
      data: {
        status: 'paid',
        paidAt: new Date(),
        paidMethod: paidMethod || 'manual',
        notes: notes || null
      }
    })

    return NextResponse.json({
      success: true,
      message: `Marked ${transactionIds.length} transactions as paid`
    })

  } catch (error: any) {
    console.error('Error marking commissions as paid:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update commissions',
        details: error.message
      },
      { status: 500 }
    )
  }
}

