import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// POST /api/studio/update-employment - Update team member employment settings
export async function POST(request: NextRequest) {
  try {
    const ownerEmail = request.headers.get('x-user-email')
    
    if (!ownerEmail) {
      return NextResponse.json({ error: 'Owner email required' }, { status: 401 })
    }

    // Verify owner
    const owner = await prisma.user.findUnique({
      where: { email: ownerEmail },
      select: {
        id: true,
        role: true,
        studioName: true
      }
    })

    if (!owner || !['owner', 'manager', 'director'].includes(owner.role)) {
      return NextResponse.json({ error: 'Unauthorized - Owner/Manager only' }, { status: 403 })
    }

    const { memberId, employmentType, commissionRate, boothRentAmount } = await request.json()

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
    }

    // Verify member is in same studio
    const member = await prisma.user.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    if (member.studioName !== owner.studioName) {
      return NextResponse.json({ error: 'Cannot modify members from other studios' }, { status: 403 })
    }

    // Validate employment type
    if (employmentType && !['commissioned', 'booth_renter'].includes(employmentType)) {
      return NextResponse.json({ error: 'Invalid employment type' }, { status: 400 })
    }

    // Validate commission rate
    if (commissionRate !== undefined && (commissionRate < 0 || commissionRate > 100)) {
      return NextResponse.json({ error: 'Commission rate must be between 0 and 100' }, { status: 400 })
    }

    // Update employment settings
    const updated = await prisma.user.update({
      where: { id: memberId },
      data: {
        employmentType: employmentType || null,
        commissionRate: commissionRate !== undefined ? commissionRate : null,
        boothRentAmount: boothRentAmount !== undefined ? boothRentAmount : null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employmentType: true,
        commissionRate: true,
        boothRentAmount: true
      }
    })

    console.log(`✅ Updated employment settings for ${updated.name}:`, {
      employmentType: updated.employmentType,
      commissionRate: updated.commissionRate,
      boothRentAmount: updated.boothRentAmount
    })

    return NextResponse.json({
      success: true,
      member: updated,
      message: `Employment settings updated for ${updated.name}`
    })

  } catch (error: any) {
    console.error('Error updating employment settings:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update employment settings',
        details: error.message
      },
      { status: 500 }
    )
  }
}

