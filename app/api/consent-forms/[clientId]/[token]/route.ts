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
    
    // If not found in memory, try to load from localStorage via request headers
    if (!form) {
      console.log(`Form not found in memory for key: ${key}`)
      
      // Try to get form data from localStorage (passed via headers)
      const localStorageData = request.headers.get('x-local-storage-data')
      if (localStorageData) {
        try {
          const allForms = JSON.parse(localStorageData)
          form = allForms.find((f: any) => f.clientId === clientId && f.token === token)
          if (form) {
            // Store in memory for this session
            consentFormsStorage.set(key, form)
            console.log(`Loaded form from localStorage for key: ${key}`)
          }
        } catch (error) {
          console.error('Error parsing localStorage data:', error)
        }
      }
    }
    
    // If still not found, create a demo form for testing purposes
    if (!form) {
      console.log(`Creating demo form for key: ${key}`)
      
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
      // Get the artist's email from the form or use a default
      const artistEmail = form.artistEmail || 'tyronejackboy@gmail.com'
      
      const notificationData = {
        type: 'form-completed',
        title: 'Consent Form Completed',
        message: `${form.clientName} has completed their ${form.formType} consent form`,
        priority: 'medium',
        actionRequired: false,
        metadata: {
          clientId: form.clientId,
          clientName: form.clientName,
          formType: form.formType,
          formId: form.id,
          pdfUrl: pdfUrl
        }
      }
      
      // Create notification in database
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': artistEmail
        },
        body: JSON.stringify(notificationData)
      })
      
      if (!response.ok) {
        console.error('Failed to create notification:', await response.text())
      }
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


