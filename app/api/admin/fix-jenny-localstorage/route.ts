import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { adminKey } = await request.json()
    
    if (adminKey !== 'fix-jenny-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Jenny's CORRECT info from database
    const jenny = await prisma.user.findUnique({
      where: { email: 'jenny@universalbeautystudio.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        businessName: true,
        selectedPlan: true
      }
    })
    
    if (!jenny) {
      return NextResponse.json({ error: 'Jenny not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Use this data to update localStorage',
      correctUserData: {
        id: jenny.id,
        name: jenny.name,
        email: jenny.email,
        role: jenny.role,
        studioName: jenny.studioName,
        businessName: jenny.businessName,
        selectedPlan: jenny.selectedPlan,
        subscription: jenny.selectedPlan,
        hasActiveSubscription: true
      },
      instructions: [
        '1. Copy the correctUserData object above',
        '2. Open browser console as Jenny',
        '3. Run: localStorage.setItem("demoUser", JSON.stringify(correctUserData))',
        '4. Reload the page',
        '5. All instructors should now appear'
      ]
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

