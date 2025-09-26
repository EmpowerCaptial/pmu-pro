import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/email-service';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with that email exists, we have sent a password reset link.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store reset token in database
    await prisma.magicLinkToken.create({
      data: {
        userId: user.id,
        email: user.email,
        token: resetToken,
        expiresAt: resetTokenExpiry,
        used: false
      }
    });

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${resetToken}`;

    // Send password reset email
    try {
      await EmailService.sendEmail({
        to: user.email,
        subject: 'Reset Your PMU Pro Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #8b5cf6; margin-bottom: 10px;">PMU Pro</h1>
              <h2 style="color: #333; margin: 0;">Password Reset Request</h2>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; color: #333; font-size: 16px;">
                Hello ${user.name || 'there'},
              </p>
              <p style="margin: 10px 0 0 0; color: #666;">
                We received a request to reset your password for your PMU Pro account. If you made this request, click the button below to reset your password.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Security Notice:</strong> This link will expire in 24 hours for your security. If you didn't request this password reset, you can safely ignore this email.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #8b5cf6; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
          </div>
        `,
        text: `
          PMU Pro - Password Reset Request
          
          Hello ${user.name || 'there'},
          
          We received a request to reset your password for your PMU Pro account. If you made this request, visit the link below to reset your password:
          
          ${resetUrl}
          
          This link will expire in 24 hours for your security. If you didn't request this password reset, you can safely ignore this email.
          
          Best regards,
          The PMU Pro Team
        `
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`Password reset email sent to: ${user.email}`);
        console.log(`Reset URL: ${resetUrl}`);
      }
    } catch (emailError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to send password reset email:', emailError);
      }
      // Don't fail the request if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'If an account with that email exists, we have sent a password reset link.' 
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Password reset request error:', error);
    }
    
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}
