import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        role: true,
        createdAt: true,
        hasActiveSubscription: true,
        subscriptionStatus: true,
        isLicenseVerified: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        found: false, 
        message: `User with email ${email} not found in database` 
      });
    }

    return NextResponse.json({ 
      found: true, 
      user 
    });

  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 }
    );
  }
}
