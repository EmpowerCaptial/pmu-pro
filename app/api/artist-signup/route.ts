import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ArtistApplicationService } from '@/lib/artist-application-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      email,
      phone,
      businessName,
      businessAddress,
      licenseNumber,
      licenseState,
      experience,
      specialties,
      portfolioUrl,
      socialMedia
    } = await req.json();

    // Validate required fields
    if (!name || !email || !phone || !businessName || !businessAddress || !experience) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 400 });
    }

    // Set a flag to indicate password needs to be set
    const hashedPassword = await bcrypt.hash('temp-password', 12);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        businessName,
        phone,
        licenseNumber: licenseNumber || 'PENDING',
        licenseState: licenseState || 'PENDING',
        yearsExperience: experience,
        selectedPlan: 'trial',
        hasActiveSubscription: false,
        isLicenseVerified: false,
        role: 'artist',
        subscriptionStatus: 'trial'
      }
    });

    // Also create application record for admin review
    const application = ArtistApplicationService.submitApplication({
      name,
      email,
      phone,
      businessName,
      businessAddress,
      licenseNumber,
      licenseState,
      experience,
      specialties,
      portfolioUrl,
      socialMedia
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ User created in database: ${user.email}`);
      console.log(`✅ Application created: ${application.id}`);
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        businessName: user.businessName,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus
      },
      application: {
        id: application.id,
        status: application.status,
        trialAccess: application.trialAccess
      },
      needsPasswordSetup: true,
      message: 'Account created successfully. Please set up your password to continue.'
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Artist signup error:', error);
    }
    
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
