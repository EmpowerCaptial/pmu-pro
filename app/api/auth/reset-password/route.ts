import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { token, password, confirmPassword } = await req.json();

    if (!token || !password || !confirmPassword) {
      return NextResponse.json({ 
        error: 'Token, password, and confirmation are required' 
      }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ 
        error: 'Passwords do not match' 
      }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
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
        user: true
      }
    });

    if (!resetToken) {
      return NextResponse.json({ 
        error: 'Invalid or expired reset token' 
      }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and mark token as used
    await prisma.$transaction(async (tx) => {
      // Update user password
      await tx.user.update({
        where: { id: resetToken.userId },
        data: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      });

      // Mark token as used
      await tx.magicLinkToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      });
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset successful for user: ${resetToken.user.email}`);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Password has been reset successfully' 
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Password reset error:', error);
    }
    
    return NextResponse.json(
      { error: 'An error occurred while resetting your password. Please try again.' },
      { status: 500 }
    );
  }
}
