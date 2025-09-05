import { NextRequest, NextResponse } from 'next/server'
import SignatureDetectionService from '@/lib/signature-detection-service'
import SignatureGenerationService from '@/lib/signature-generation-service'

export async function POST(request: NextRequest) {
  try {
    const { pdfUrl, templateType, clientId, signatureData } = await request.json()

    console.log('API: Document signing request received:', { pdfUrl, templateType, clientId })

    if (!pdfUrl || !clientId || !signatureData) {
      return NextResponse.json(
        { error: 'Missing required parameters: pdfUrl, clientId, or signatureData' },
        { status: 400 }
      )
    }

    // Initialize services
    const signatureDetectionService = SignatureDetectionService.getInstance()
    const signatureGenerationService = SignatureGenerationService.getInstance()

    // Fetch PDF buffer
    const pdfResponse = await fetch(pdfUrl)
    if (!pdfResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch PDF document' },
        { status: 400 }
      )
    }

    const arrayBuffer = await pdfResponse.arrayBuffer()
    const pdfBuffer = Buffer.from(arrayBuffer)

    // Detect signature areas
    const { fields, areas } = await signatureDetectionService.detectSignatureAreas(pdfBuffer, templateType)
    
    console.log('API: Detected signature areas:', { fields: fields.length, areas: areas.length })

    // Generate signature
    const generatedSignature = await signatureGenerationService.generateSignature(signatureData)
    
    // Save signature to client profile
    await signatureGenerationService.saveSignatureToClient(clientId, generatedSignature)

    // Add signature to all detected areas (for demo purposes)
    let modifiedPdfBuffer: Uint8Array = pdfBuffer
    
    // Add to form fields first
    for (const field of fields) {
      try {
        modifiedPdfBuffer = await signatureGenerationService.addSignatureToPDF(
          modifiedPdfBuffer,
          field,
          generatedSignature.signatureImage
        )
      } catch (error) {
        console.error('API: Error adding signature to field:', field.name, error)
      }
    }

    // Add to template areas
    for (const area of areas) {
      try {
        modifiedPdfBuffer = await signatureGenerationService.addSignatureToCoordinates(
          modifiedPdfBuffer,
          area.x,
          area.y,
          area.width,
          area.height,
          generatedSignature.signatureImage,
          area.page - 1
        )
      } catch (error) {
        console.error('API: Error adding signature to area:', area.id, error)
      }
    }

    // Convert buffer to base64 for response
    const signedPdfBase64 = Buffer.from(modifiedPdfBuffer).toString('base64')

    console.log('API: Document signed successfully')

    return NextResponse.json({
      success: true,
      signedPdf: signedPdfBase64,
      signatureId: generatedSignature.id,
      detectedAreas: {
        fields: fields.length,
        areas: areas.length
      }
    })

  } catch (error) {
    console.error('API: Error in document signing:', error)
    return NextResponse.json(
      { error: 'Internal server error during document signing' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pdfUrl = searchParams.get('pdfUrl')
    const templateType = searchParams.get('templateType')
    const clientId = searchParams.get('clientId')

    if (!pdfUrl || !clientId) {
      return NextResponse.json(
        { error: 'Missing required parameters: pdfUrl and clientId' },
        { status: 400 }
      )
    }

    console.log('API: Signature detection request:', { pdfUrl, templateType, clientId })

    // Initialize detection service
    const signatureDetectionService = SignatureDetectionService.getInstance()

    // Fetch PDF buffer
    const pdfResponse = await fetch(pdfUrl)
    if (!pdfResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch PDF document' },
        { status: 400 }
      )
    }

    const arrayBuffer = await pdfResponse.arrayBuffer()
    const pdfBuffer = Buffer.from(arrayBuffer)

    // Detect signature areas
    const { fields, areas } = await signatureDetectionService.detectSignatureAreas(
      pdfBuffer, 
      templateType || undefined
    )

    console.log('API: Detection complete:', { fields: fields.length, areas: areas.length })

    return NextResponse.json({
      success: true,
      signatureFields: fields,
      signatureAreas: areas,
      totalAreas: fields.length + areas.length
    })

  } catch (error) {
    console.error('API: Error in signature detection:', error)
    return NextResponse.json(
      { error: 'Internal server error during signature detection' },
      { status: 500 }
    )
  }
}
