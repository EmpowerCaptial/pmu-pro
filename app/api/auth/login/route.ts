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

    // Check hardcoded production accounts first (fallback for client-side issues)
    if (email === 'admin@thepmuguide.com' && password === 'ubsa2024!') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'admin_pmu_001',
          name: 'PMU Pro Admin',
          email: 'admin@thepmuguide.com',
          selectedPlan: 'enterprise',
          hasActiveSubscription: true,
          subscriptionStatus: 'active',
          platformRole: 'admin',
          studios: [{
            id: 'admin_pmu_001',
            name: 'PMU Pro Admin',
            slug: 'pmu-pro-admin',
            role: 'owner',
            status: 'active'
          }]
        }
      });
    }

    if (email === 'ubsateam@thepmuguide.com' && password === 'ubsa2024!') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'ubsa_owner_001',
          name: 'UBSA Team',
          email: 'ubsateam@thepmuguide.com',
          selectedPlan: 'enterprise',
          hasActiveSubscription: true,
          subscriptionStatus: 'active',
          platformRole: 'admin',
          studios: [{
            id: 'ubsa_owner_001',
            name: 'UBSA Team',
            slug: 'ubsa-team',
            role: 'owner',
            status: 'active'
          }]
        }
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Get user's studio memberships
          const studioMemberships = await prisma.studioMember.findMany({
      where: { userId: user.id },
      include: {
        studio: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    // Check if user has a temporary password
    if (user.password === 'temp-password') {
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

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      user: {
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        businessName: userWithoutPassword.businessName,
        licenseNumber: userWithoutPassword.licenseNumber,
        licenseState: userWithoutPassword.licenseState,
        selectedPlan: userWithoutPassword.selectedPlan,
        hasActiveSubscription: userWithoutPassword.hasActiveSubscription,
        subscriptionStatus: userWithoutPassword.subscriptionStatus,
        platformRole: userWithoutPassword.platformRole,
        twofaEnabled: userWithoutPassword.twofaEnabled,
        createdAt: userWithoutPassword.createdAt,
        studios: studioMemberships.map(membership => ({
          id: membership.studio.id,
          name: membership.studio.name,
          slug: membership.studio.slug,
          role: membership.role,
          status: membership.status
        }))
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Login failed' 
    }, { status: 500 });
  }
}
