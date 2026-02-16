import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Security: All authentication now goes through database verification
    // No hardcoded credentials for production security

    // Normalize email (trim and lowercase) to handle input variations
    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email (case-insensitive search to handle input variations)
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive'
        }
      },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            businessName: true,
            studioName: true,
            licenseNumber: true,
            licenseState: true,
            selectedPlan: true,
            hasActiveSubscription: true,
            subscriptionStatus: true,
            isLicenseVerified: true,
            role: true,
            createdAt: true,
            locationId: true,
            hasAllLocationAccess: true
          }
        });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if user has a temporary password
    const isTempPassword = await bcrypt.compare('temp-password', user.password);
    if (isTempPassword) {
      return NextResponse.json({ 
        error: 'Please set up your password first',
        needsPasswordSetup: true,
        email: user.email
      }, { status: 400 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Return user data (without password) - ONLY CONFIRMED EXISTING FIELDS
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      user: {
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        businessName: userWithoutPassword.businessName,
        studioName: userWithoutPassword.studioName,
        licenseNumber: userWithoutPassword.licenseNumber,
        licenseState: userWithoutPassword.licenseState,
        selectedPlan: userWithoutPassword.selectedPlan,
        hasActiveSubscription: userWithoutPassword.hasActiveSubscription,
        subscriptionStatus: userWithoutPassword.subscriptionStatus,
        isLicenseVerified: userWithoutPassword.isLicenseVerified,
        role: userWithoutPassword.role,
        createdAt: userWithoutPassword.createdAt,
        locationId: (userWithoutPassword as any).locationId ?? null,
        hasAllLocationAccess: (userWithoutPassword as any).hasAllLocationAccess ?? false,
        studios: [{
          id: 'default-studio',
          name: userWithoutPassword.businessName || userWithoutPassword.name || 'Default Studio',
          slug: 'default-studio',
          role: 'owner',
          status: 'active'
        }]
      }
    });

  } catch (error) {
    // Log error securely without exposing sensitive information
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    
    // In production, log to secure logging service instead of console
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', errorMessage);
    }
    
    return NextResponse.json({ 
      error: 'Authentication failed. Please check your credentials and try again.'
    }, { status: 500 });
  }
}
