import { NextRequest, NextResponse } from 'next/server'
import { ConsentForm } from '@/types/consent-forms'
import { consentFormsStorage, formAuditLog, logFormAccess, createNotification } from '@/lib/shared-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string; token: string } }
) {
  try {
    const { clientId, token } = params
    const key = `${clientId}-${token}`
    
    // Try to get form from in-memory storage first
    let form = consentFormsStorage.get(key)
    
    // If not found in memory, try to reconstruct from demo data
    if (!form) {
      console.log(`Form not found in memory for key: ${key}`)
      
      // Create a demo form for testing purposes
      form = {
        id: `form_${Date.now()}`,
        clientId: clientId,
        clientName: "Demo Client",
        formType: "general-consent",
        sendMethod: "email",
        contactInfo: "demo@example.com",
        customMessage: "Please complete this consent form",
        token: token,
        createdAt: new Date(),
        sentAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: "sent",
        reminderSent: false
      }
      
      // Store it back in memory for this session
      consentFormsStorage.set(key, form)
      
      console.log(`Created demo form for key: ${key}`)
    }
    
    // Check if form has expired
    if (new Date() > new Date(form.expiresAt)) {
      return NextResponse.json(
        { error: 'This form has expired' },
        { status: 410 }
      )
    }
    
    // Log access for audit trail
    logFormAccess(form.id, 'view', { clientId, token })
    
    return NextResponse.json({ form })
    
  } catch (error) {
    console.error('Error retrieving consent form:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve form' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { clientId: string; token: string } }
) {
  try {
    const { clientId, token } = params
    const key = `${clientId}-${token}`
    const body = await request.json()
    
    // Store the form data
    consentFormsStorage.set(key, body)
    
    // Log form creation
    logFormAccess(body.id, 'created', { clientId, token, formType: body.formType })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Form data stored successfully' 
    })
    
  } catch (error) {
    console.error('Error storing consent form:', error)
    return NextResponse.json(
      { error: 'Failed to store form' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string; token: string } }
) {
  try {
    const { clientId, token } = params
    const key = `${clientId}-${token}`
    const body = await request.json()
    
    const form = consentFormsStorage.get(key)
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or has expired' },
        { status: 404 }
      )
    }
    
    // Check if form has expired
    if (new Date() > new Date(form.expiresAt)) {
      return NextResponse.json(
        { error: 'This form has expired' },
        { status: 410 }
      )
    }
    
    // Generate PDF URL for the completed form
    const pdfUrl = `/api/consent-forms/${clientId}/${token}/pdf`
    
    // Update form with submitted data
    const updatedForm: ConsentForm = {
      ...form,
      status: 'completed',
      completedAt: new Date(),
      formData: body.formData,
      pdfUrl: pdfUrl
    }
    
    consentFormsStorage.set(key, updatedForm)
    
    // Log form completion
    logFormAccess(form.id, 'completed', { 
      clientId, 
      token, 
      formType: form.formType,
      completedAt: new Date().toISOString()
    })
    
    // Create notification for the artist
    try {
      const notification = {
        id: `form-completed-${form.id}-${Date.now()}`,
        type: 'form-completed',
        clientId: form.clientId,
        clientName: form.clientName,
        formType: form.formType,
        formId: form.id,
        message: `${form.clientName} has completed their ${form.formType} consent form`,
        timestamp: new Date().toISOString(),
        isRead: false,
        actionRequired: false,
        priority: 'medium',
        pdfUrl: pdfUrl
      }
      
      // In a real app, you'd get the artist ID from the form or user context
      const artistId = 'default-artist' // This should come from the form or user context
      
      createNotification(artistId, notification)
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError)
      // Don't fail the form submission if notification fails
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Form submitted successfully',
      pdfUrl: pdfUrl
    })
    
  } catch (error) {
    console.error('Error submitting consent form:', error)
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    )
  }
}


