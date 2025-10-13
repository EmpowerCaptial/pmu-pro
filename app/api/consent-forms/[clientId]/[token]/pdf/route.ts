import { NextRequest, NextResponse } from 'next/server'
import { getFormTemplate } from '@/lib/data/consent-form-templates'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string; token: string } }
) {
  try {
    const { clientId, token } = params
    
    // Get form from database
    const form = await prisma.consentForm.findUnique({
      where: { token },
      include: {
        client: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
    }
    
    if (form.status !== 'completed') {
      return NextResponse.json(
        { error: 'Form not completed yet' },
        { status: 400 }
      )
    }
    
    // Generate PDF content (HTML for now, can be converted to PDF with puppeteer later)
    const htmlContent = generateConsentFormHTML(form)
    
    // Return HTML for viewing (can be printed as PDF by browser)
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function generateConsentFormHTML(form: any): string {
  const template = getFormTemplate(form.formType)
  const formData = form.formData as any // Type assertion for dynamic field access
  
  if (!template) {
    throw new Error('Form template not found')
  }
  
  // Create HTML content for viewing/printing
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${template.name} - ${form.clientName}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 40px; 
          line-height: 1.6; 
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
        }
        .header { 
          text-align: center; 
          border-bottom: 2px solid #333; 
          padding-bottom: 20px; 
          margin-bottom: 30px; 
        }
        .section { margin-bottom: 25px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; margin-bottom: 5px; }
        .value { 
          padding: 8px; 
          background: #f9f9f9; 
          border: 1px solid #ddd; 
          border-radius: 4px; 
          word-wrap: break-word;
        }
        .signature { 
          margin-top: 30px; 
          border-top: 1px solid #333; 
          padding-top: 20px; 
        }
        .signature img { 
          max-width: 200px; 
          border: 1px solid #ccc; 
        }
        .footer { 
          margin-top: 40px; 
          text-align: center; 
          font-size: 12px; 
          color: #666; 
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        .completed { color: green; font-weight: bold; }
        @media print {
          body { margin: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${template.name}</h1>
        <h2>PMU Pro - Professional Permanent Makeup Platform</h2>
        <p>Client: ${form.clientName}</p>
        <p>Completed: ${form.completedAt ? new Date(form.completedAt).toLocaleString() : 'N/A'}</p>
      </div>
      
      <div class="section">
        <h3>Form Details</h3>
        ${formData ? Object.keys(formData).filter(key => key !== 'signature').map(key => {
          const value = formData[key]
          if (!value || typeof value === 'object') return ''
          return `
            <div class="field">
              <div class="label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</div>
              <div class="value">${value}</div>
            </div>
          `
        }).join('') : '<p>No form data available</p>'}
      </div>
      
      ${form.clientSignature ? `
        <div class="signature">
          <h3>Digital Signature</h3>
          <p>Client signature provided electronically:</p>
          <img src="${form.clientSignature}" alt="Client Signature" />
          <p>Signed on: ${form.clientSignatureDate ? new Date(form.clientSignatureDate).toLocaleString() : 'N/A'}</p>
        </div>
      ` : ''}
      
      <div class="footer">
        <p class="completed">✓ FORM COMPLETED</p>
        <p>Form ID: ${form.id}</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>PMU Pro - Professional Permanent Makeup Platform</p>
        <p style="margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #6B46C1; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
            Print / Save as PDF
          </button>
        </p>
      </div>
    </body>
    </html>
  `
  
  return htmlContent
}
