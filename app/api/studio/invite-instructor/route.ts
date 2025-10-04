import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { instructorEmail, instructorName, studioName, studioOwnerName } = await req.json();

    if (!instructorEmail || !instructorName || !studioName || !studioOwnerName) {
      return NextResponse.json({ 
        error: 'Missing required fields: instructorEmail, instructorName, studioName, studioOwnerName' 
      }, { status: 400 });
    }

    // Send invitation email
    await EmailService.sendInstructorInvitation({
      to: instructorEmail,
      instructorName,
      studioName,
      studioOwnerName
    });

    return NextResponse.json({
      success: true,
      message: 'Instructor invitation sent successfully',
      data: {
        instructorEmail,
        instructorName,
        studioName,
        studioOwnerName,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error sending instructor invitation:', error);
    return NextResponse.json({ 
      error: 'Failed to send instructor invitation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
