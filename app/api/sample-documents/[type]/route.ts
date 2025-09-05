import { NextRequest, NextResponse } from 'next/server'
import { 
  generateSampleConsentForm, 
  generateSampleMedicalHistory, 
  generateSampleTreatmentPlan 
} from '@/lib/sample-pdf-generator'

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = params

    console.log('API: Generating sample PDF for type:', type)

    let pdfBytes: Uint8Array

    switch (type) {
      case 'consent-form':
        pdfBytes = await generateSampleConsentForm()
        break
      case 'medical-history':
        pdfBytes = await generateSampleMedicalHistory()
        break
      case 'treatment-plan':
        pdfBytes = await generateSampleTreatmentPlan()
        break
      default:
        return NextResponse.json(
          { error: 'Invalid document type' },
          { status: 400 }
        )
    }

    console.log('API: Sample PDF generated successfully, size:', pdfBytes.length)

    // Validate PDF header
    const pdfHeader = new TextDecoder().decode(pdfBytes.slice(0, 8))
    if (!pdfHeader.startsWith('%PDF-')) {
      console.error('API: Generated PDF is invalid - missing PDF header:', pdfHeader)
      return NextResponse.json(
        { error: 'Generated PDF is invalid' },
        { status: 500 }
      )
    }

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${type}.pdf"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    })

  } catch (error) {
    console.error('API: Error generating sample PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate sample PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
