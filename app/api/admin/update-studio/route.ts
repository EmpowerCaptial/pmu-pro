import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, studioName, businessName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Update user with correct studio information
    const user = await prisma.user.update({
      where: { email },
      data: {
        studioName,
        businessName
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        studioName: user.studioName,
        businessName: user.businessName
      }
    });

  } catch (error) {
    console.error('Error updating studio:', error);
    return NextResponse.json(
      { error: 'Failed to update studio information' },
      { status: 500 }
    );
  }
}

