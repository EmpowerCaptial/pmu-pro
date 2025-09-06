import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function GET(request: NextRequest) {
  try {
    console.log('Test PDF: Generating simple test PDF...')
    
    // Create a simple test PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([612, 792]) // Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    // Add some text
    page.drawText('Test PDF Document', {
      x: 50,
      y: 750,
      size: 24,
      font,
      color: rgb(0, 0, 0)
    })
    
    page.drawText('This is a test PDF to verify generation is working.', {
      x: 50,
      y: 700,
      size: 12,
      font,
      color: rgb(0, 0, 0)
    })
    
    page.drawText('Generated at: ' + new Date().toISOString(), {
      x: 50,
      y: 650,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5)
    })
    
    const pdfBytes = await pdfDoc.save()
    
    console.log('Test PDF: Generated successfully, size:', pdfBytes.length)
    
    // Validate PDF header
    const pdfHeader = new TextDecoder().decode(pdfBytes.slice(0, 8))
    console.log('Test PDF: Header:', pdfHeader)
    
    if (!pdfHeader.startsWith('%PDF-')) {
      throw new Error('Generated PDF is invalid - missing PDF header')
    }
    
    return new Response(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="test.pdf"',
        'Content-Length': pdfBytes.length.toString(),
      },
    })
    
  } catch (error) {
    console.error('Test PDF: Error generating PDF:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate test PDF', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}


