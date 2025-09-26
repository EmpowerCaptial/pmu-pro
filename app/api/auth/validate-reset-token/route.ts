import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 });
    }

    // Find the reset token
    const resetToken = await prisma.magicLinkToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: {
          gt: new Date() // Token hasn't expired
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!resetToken) {
      return NextResponse.json({ 
        error: 'Invalid or expired reset token' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      valid: true,
      user: {
        id: resetToken.user.id,
        email: resetToken.user.email,
        name: resetToken.user.name
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Token validation error:', error);
    }
    
    return NextResponse.json(
      { error: 'An error occurred while validating the reset token' },
      { status: 500 }
    );
  }
}
