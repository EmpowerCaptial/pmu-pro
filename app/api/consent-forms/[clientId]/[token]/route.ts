import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/consent-forms/[clientId]/[token] - Get form by token (client view)
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string; token: string } }
) {
  try {
    const { clientId, token } = params
    
    // Find form in database by token
    const form = await prisma.consentForm.findUnique({
      where: { token },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or has expired' },
        { status: 404 }
      )
    }
    
    // Check if form has expired
    if (new Date() > new Date(form.expiresAt)) {
      // Update status to expired if not already
      if (form.status !== 'expired') {
        await prisma.consentForm.update({
          where: { id: form.id },
          data: { status: 'expired' }
        })
      }
      
      return NextResponse.json(
        { error: 'This form has expired' },
        { status: 410 }
      )
    }
    
    return NextResponse.json({ form })
    
  } catch (error) {
    console.error('Error retrieving consent form:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve form', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/consent-forms/[clientId]/[token] - Submit completed form
export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string; token: string } }
) {
  try {
    const { clientId, token } = params
    const body = await request.json()
    
    // Find form in database
    const form = await prisma.consentForm.findUnique({
      where: { token }
    })
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or has expired' },
        { status: 404 }
      )
    }
    
    // Check if form has expired
    if (new Date() > new Date(form.expiresAt)) {
      await prisma.consentForm.update({
        where: { id: form.id },
        data: { status: 'expired' }
      })
      
      return NextResponse.json(
        { error: 'This form has expired' },
        { status: 410 }
      )
    }
    
    // Generate PDF URL for the completed form
    const pdfUrl = `/api/consent-forms/${clientId}/${token}/pdf`
    
    // Update form with submitted data
    // Handle nested objects - convert to strings for database storage
    const medicalHistory = body.formData?.medicalHistory
    const emergencyContact = body.formData?.emergencyContact
    
    const updatedForm = await prisma.consentForm.update({
      where: { id: form.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        formData: body.formData || {},
        pdfUrl,
        clientSignature: body.formData?.clientSignature || body.clientSignature || null,
        clientSignatureDate: new Date(),
        // Convert objects to strings or extract string values
        medicalHistory: typeof medicalHistory === 'object' 
          ? JSON.stringify(medicalHistory) 
          : (medicalHistory || null),
        allergies: typeof medicalHistory === 'object'
          ? (medicalHistory.allergies?.join(', ') || null)
          : (body.formData?.allergies || null),
        medications: typeof medicalHistory === 'object'
          ? (medicalHistory.medications?.join(', ') || null)
          : (body.formData?.medications || null),
        skinConditions: typeof medicalHistory === 'object'
          ? (medicalHistory.conditions?.join(', ') || null)
          : (body.formData?.skinConditions || null),
        previousProcedures: body.formData?.previousProcedures || null,
        emergencyContact: typeof emergencyContact === 'object'
          ? `${emergencyContact.name} (${emergencyContact.relationship}) - ${emergencyContact.phone}`
          : (emergencyContact || null),
        additionalNotes: body.formData?.additionalNotes || null,
        consentGiven: body.formData?.consentAcknowledged ?? body.formData?.consentGiven ?? true,
        photographyConsent: body.formData?.photoConsent ?? body.formData?.photographyConsent ?? false,
        marketingConsent: body.formData?.marketingConsent ?? false
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    // Create notification for the artist
    if (form.userId) {
      try {
        await prisma.notification.create({
          data: {
            userId: form.userId,
            type: 'consent_form_completed',
            title: 'Consent Form Completed',
            message: `${updatedForm.clientName} has completed the ${form.formType} consent form`,
            priority: 'high',
            actionRequired: false,
            metadata: {
              formId: updatedForm.id,
              clientId: updatedForm.clientId,
              formType: updatedForm.formType
            }
          }
        })
      } catch (notifError) {
        console.error('Error creating notification:', notifError)
        // Don't fail the form submission if notification fails
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Form submitted successfully',
      form: updatedForm
    })
    
  } catch (error) {
    console.error('Error submitting consent form:', error)
    return NextResponse.json(
      { error: 'Failed to submit form', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
