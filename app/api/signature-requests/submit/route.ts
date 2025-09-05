import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'
import { signatureRequests, signedDocuments } from '@/lib/signature-storage'

export async function POST(request: NextRequest) {
  try {
    const { token, clientName, clientEmail, signature } = await request.json()

    if (!token || !clientName || !clientEmail || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: token, clientName, clientEmail, signature' },
        { status: 400 }
      )
    }

    // Get the signature request
    const signatureRequest = signatureRequests.get(token)
    
    if (!signatureRequest) {
      return NextResponse.json(
        { error: 'Signature request not found' },
        { status: 404 }
      )
    }

    // Check if signature request has expired
    if (new Date() > signatureRequest.expiresAt) {
      return NextResponse.json(
        { error: 'Signature request has expired' },
        { status: 410 }
      )
    }

    // Create signed document record
    const signedDocument = {
      id: `signed_${Date.now()}`,
      token,
      clientName,
      clientEmail,
      signature,
      signedAt: new Date(),
      documentTitle: signatureRequest.documentTitle,
      documentUrl: signatureRequest.documentUrl,
      artistName: signatureRequest.artistName,
      status: 'completed'
    }

    // Store the signed document
    signedDocuments.set(token, signedDocument)
    
    // Update signature request status
    signatureRequest.status = 'completed'
    signatureRequest.signedDocument = signedDocument

    // Send confirmation email to client
    await EmailService.sendEmail({
      to: clientEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@thepmuguide.com',
      subject: `Document Signed: ${signatureRequest.documentTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B5CF6;">Document Signed Successfully!</h2>
          <p>Dear ${clientName},</p>
          <p>Your document <strong>${signatureRequest.documentTitle}</strong> has been signed successfully.</p>
          <p><strong>Signed by:</strong> ${clientName}</p>
          <p><strong>Date:</strong> ${signedDocument.signedAt.toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${signedDocument.signedAt.toLocaleTimeString()}</p>
          <p>Your PMU artist has been notified and will contact you if needed.</p>
          <p>Thank you!</p>
        </div>
      `,
      text: `
        Document Signed Successfully!
        
        Dear ${clientName},
        
        Your document ${signatureRequest.documentTitle} has been signed successfully.
        
        Signed by: ${clientName}
        Date: ${signedDocument.signedAt.toLocaleDateString()}
        Time: ${signedDocument.signedAt.toLocaleTimeString()}
        
        Your PMU artist has been notified and will contact you if needed.
        
        Thank you!
      `
    })

    // Send notification email to artist
    await EmailService.sendEmail({
      to: signatureRequest.artistEmail || 'artist@thepmuguide.com', // In production, get from signature request
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@thepmuguide.com',
      subject: `Document Signed: ${signatureRequest.documentTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B5CF6;">Document Signed by Client</h2>
          <p>A client has signed the document you requested.</p>
          <p><strong>Document:</strong> ${signatureRequest.documentTitle}</p>
          <p><strong>Client:</strong> ${clientName} (${clientEmail})</p>
          <p><strong>Signed:</strong> ${signedDocument.signedAt.toLocaleDateString()} at ${signedDocument.signedAt.toLocaleTimeString()}</p>
          <p>You can view the signed document in your dashboard.</p>
        </div>
      `,
      text: `
        Document Signed by Client
        
        A client has signed the document you requested.
        
        Document: ${signatureRequest.documentTitle}
        Client: ${clientName} (${clientEmail})
        Signed: ${signedDocument.signedAt.toLocaleDateString()} at ${signedDocument.signedAt.toLocaleTimeString()}
        
        You can view the signed document in your dashboard.
      `
    })

    return NextResponse.json({
      success: true,
      message: 'Document signed successfully',
      signedDocument
    })

  } catch (error) {
    console.error('Error submitting signature:', error)
    return NextResponse.json(
      { error: 'Failed to submit signature' },
      { status: 500 }
    )
  }
}
