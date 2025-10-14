import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/studio/separate-member - Separate a team member into their own independent account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberEmail, newPlan, ownerEmail } = body

    if (!memberEmail || !newPlan || !ownerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the owner exists and has permission
    const owner = await prisma.user.findUnique({
      where: { email: ownerEmail }
    })

    if (!owner || owner.role !== 'owner') {
      return NextResponse.json({ error: 'Only studio owners can separate team members' }, { status: 403 })
    }

    // Get the team member
    const member = await prisma.user.findUnique({
      where: { email: memberEmail }
    })

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Verify they're in the same studio
    if (member.studioName !== owner.studioName) {
      return NextResponse.json({ error: 'Team member is not in your studio' }, { status: 403 })
    }

    // Update the member's account to be independent
    const updatedMember = await prisma.user.update({
      where: { email: memberEmail },
      data: {
        selectedPlan: newPlan,
        studioName: null, // Remove studio affiliation
        role: newPlan === 'starter' ? 'artist' : 'licensed', // Change to independent role
        // Reset employment type (they're no longer under studio)
        employmentType: null,
        commissionRate: null,
        boothRentAmount: null,
        // They'll need to subscribe separately
        hasActiveSubscription: false,
        subscriptionStatus: 'inactive'
      }
    })

    return NextResponse.json({ 
      success: true,
      message: `${member.name} has been separated from the studio`,
      newAccount: {
        email: updatedMember.email,
        plan: newPlan,
        role: updatedMember.role,
        temporaryPassword: 'UseExistingPassword' // They keep their existing password
      }
    })

  } catch (error) {
    console.error('Error separating team member:', error)
    return NextResponse.json({ 
      error: 'Failed to separate team member',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
