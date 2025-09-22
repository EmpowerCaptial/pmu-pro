import { NextRequest, NextResponse } from 'next/server'
import { ConsentForm } from '@/types/consent-forms'
import { getFormTemplate } from '@/lib/data/consent-form-templates'
import { consentFormsStorage } from '@/lib/shared-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string; token: string } }
) {
  try {
    const { clientId, token } = params
    const key = `${clientId}-${token}`
    
    const form = consentFormsStorage.get(key)
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
    }
    
    if (form.status !== 'completed') {
      return NextResponse.json(
        { error: 'Form not completed' },
        { status: 400 }
      )
    }
    
    // Generate PDF content
    const pdfContent = generateConsentFormPDF(form)
    
    // Return PDF as downloadable file
    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="consent-form-${clientId}-${token}.pdf"`,
      },
    })
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

function generateConsentFormPDF(form: ConsentForm): string {
  const template = getFormTemplate(form.formType)
  const formData = form.formData as any // Type assertion for dynamic field access
  
  if (!template || !formData) {
    throw new Error('Form template or data not found')
  }
  
  // Create PDF content using a simple HTML structure
  // In production, use a proper PDF library like puppeteer or jsPDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${template.name} - ${form.clientName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; margin-bottom: 5px; }
        .value { padding: 8px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; }
        .signature { margin-top: 30px; border-top: 1px solid #333; padding-top: 20px; }
        .signature img { max-width: 200px; border: 1px solid #ccc; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        .completed { color: green; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${template.name}</h1>
        <h2>PMU Pro - Professional Permanent Makeup Platform</h2>
        <p>Client: ${form.clientName} | Date: ${form.completedAt ? new Date(form.completedAt).toLocaleDateString() : 'N/A'}</p>
      </div>
      
      <div class="section">
        <h3>Client Information</h3>
        ${template.fields.map(field => {
          if (field.id === 'clientSignature') return ''
          const value = formData[field.id]
          if (!value) return ''
          return `
            <div class="field">
              <div class="label">${field.label}:</div>
              <div class="value">${value}</div>
            </div>
          `
        }).join('')}
      </div>
      
      ${formData.clientSignature ? `
        <div class="signature">
          <h3>Digital Signature</h3>
          <p>Client signature provided electronically:</p>
          <img src="data:image/png;base64,${formData.clientSignature}" alt="Client Signature" />
        </div>
      ` : ''}
      
      <div class="footer">
        <p class="completed">✓ FORM COMPLETED</p>
        <p>Form ID: ${form.id} | Token: ${form.token}</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>PMU Pro - Professional Permanent Makeup Platform</p>
      </div>
    </body>
    </html>
  `
  
  // For demo purposes, return HTML content
  // In production, convert HTML to PDF using puppeteer or similar
  return htmlContent
}
