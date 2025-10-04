import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 Debug: Checking Tyrone in production database...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'tyronejackboy@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        selectedPlan: true,
        isLicenseVerified: true,
        hasActiveSubscription: true,
        subscriptionStatus: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found in production database',
        email: 'tyronejackboy@gmail.com'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Tyrone found in production database',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        selectedPlan: user.selectedPlan,
        isLicenseVerified: user.isLicenseVerified,
        hasActiveSubscription: user.hasActiveSubscription,
        subscriptionStatus: user.subscriptionStatus
      }
    });

  } catch (error) {
    console.error('❌ Debug API error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
