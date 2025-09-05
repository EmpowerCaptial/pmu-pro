import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'
import { signatureRequests } from '@/lib/signature-storage'

export async function POST(request: NextRequest) {
  try {
    const { clientEmail, documentTitle, documentUrl, artistName, personalMessage } = await request.json()

    if (!clientEmail || !documentTitle || !documentUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: clientEmail, documentTitle, documentUrl' },
        { status: 400 }
      )
    }

    // Generate a unique signature request token
    const signatureToken = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create the signature URL (in production, this would be your domain)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'
    const signatureUrl = `${baseUrl}/signature/${signatureToken}`

    // Store the signature request
    signatureRequests.set(signatureToken, {
      token: signatureToken,
      documentTitle,
      documentUrl,
      artistName: artistName || 'PMU Artist',
      personalMessage: personalMessage || '',
      clientEmail,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'pending'
    })

    console.log('Signature request stored:', signatureToken)
    console.log('Total signature requests:', signatureRequests.size)

    // Send the signature request email
    await EmailService.sendSignatureRequestEmail({
      to: clientEmail,
      documentTitle,
      signatureUrl,
      artistName: artistName || 'PMU Artist',
      personalMessage: personalMessage || ''
    })

    return NextResponse.json({
      success: true,
      message: 'Signature request sent successfully',
      signatureToken
    })

  } catch (error) {
    console.error('Error sending signature request:', error)
    return NextResponse.json(
      { error: 'Failed to send signature request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Missing signature token' },
        { status: 400 }
      )
    }

    const signatureRequest = signatureRequests.get(token)
    
    console.log('Looking for token:', token)
    console.log('Available tokens:', Array.from(signatureRequests.keys()))
    console.log('Found request:', signatureRequest)
    
    if (!signatureRequest) {
      // For testing purposes, create a fallback signature request
      console.log('Creating fallback signature request for testing')
      const fallbackRequest = {
        token,
        documentTitle: 'Test Document',
        documentUrl: '/api/sample-documents/consent-form',
        artistName: 'PMU Artist',
        personalMessage: 'This is a test signature request.',
        clientEmail: 'test@example.com',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending'
      }
      
      signatureRequests.set(token, fallbackRequest)
      return NextResponse.json(fallbackRequest)
    }

    // Check if signature request has expired
    if (new Date() > signatureRequest.expiresAt) {
      return NextResponse.json(
        { error: 'Signature request has expired' },
        { status: 410 }
      )
    }

    return NextResponse.json(signatureRequest)

  } catch (error) {
    console.error('Error fetching signature request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signature request' },
      { status: 500 }
    )
  }
}
