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
  const formData = form.formData as any
  
  if (!template) {
    throw new Error('Form template not found')
  }
  
  // Helper to format values for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'Not provided'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'None'
    if (typeof value === 'object') {
      // Handle nested objects like emergencyContact, medicalHistory
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${formatValue(v)}`)
        .join('<br>')
    }
    return String(value)
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
          font-family: 'Georgia', serif; 
          margin: 0; 
          line-height: 1.8; 
          max-width: 850px;
          margin: 0 auto;
          padding: 40px;
          color: #333;
        }
        .header { 
          text-align: center; 
          border-bottom: 3px solid #6B46C1; 
          padding-bottom: 20px; 
          margin-bottom: 40px; 
        }
        .header h1 {
          color: #6B46C1;
          margin-bottom: 10px;
          font-size: 28px;
        }
        .header h2 {
          color: #666;
          font-size: 16px;
          font-weight: normal;
          margin-bottom: 20px;
        }
        .client-info {
          background: #f8f4ff;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .client-info strong { color: #6B46C1; }
        .section { 
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 20px;
          color: #6B46C1;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .field { 
          margin-bottom: 20px;
          padding: 15px;
          background: #fafafa;
          border-left: 4px solid #6B46C1;
          border-radius: 4px;
        }
        .label { 
          font-weight: bold; 
          color: #6B46C1;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .value { 
          color: #333;
          font-size: 15px;
          line-height: 1.6;
        }
        .consent-statement {
          background: #fff9e6;
          border: 2px solid #ffd700;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .consent-statement h3 {
          color: #b8860b;
          margin-top: 0;
        }
        .signature-section { 
          margin-top: 40px; 
          border-top: 3px solid #6B46C1; 
          padding-top: 30px;
          page-break-inside: avoid;
        }
        .signature-section h3 {
          color: #6B46C1;
          font-size: 20px;
        }
        .signature-box {
          border: 2px solid #6B46C1;
          padding: 20px;
          text-align: center;
          background: white;
          border-radius: 8px;
        }
        .signature-box img { 
          max-width: 300px;
          max-height: 150px;
          border: 1px solid #ddd;
          padding: 10px;
          background: white;
        }
        .footer { 
          margin-top: 50px; 
          text-align: center; 
          font-size: 12px; 
          color: #666; 
          border-top: 2px solid #e0e0e0;
          padding-top: 20px;
        }
        .completed-badge { 
          background: #10b981;
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: bold;
          display: inline-block;
          margin-bottom: 15px;
        }
        @media print {
          body { margin: 0; padding: 20px; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${template.name}</h1>
        <h2>PMU Guide - Professional Management Platform</h2>
      </div>
      
      <div class="client-info">
        <p><strong>Client Name:</strong> ${formData?.clientName || form.clientName || 'Not provided'}</p>
        <p><strong>Email:</strong> ${formData?.clientEmail || form.client?.email || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${formData?.clientPhone || 'Not provided'}</p>
        <p><strong>Date of Birth:</strong> ${formData?.dateOfBirth || 'Not provided'}</p>
        <p><strong>Completed:</strong> ${form.completedAt ? new Date(form.completedAt).toLocaleString() : 'N/A'}</p>
      </div>
      
      ${formData?.medicalHistory ? `
        <div class="section">
          <div class="section-title">Medical History</div>
          <div class="field">
            <div class="label">Allergies:</div>
            <div class="value">${formatValue(formData.medicalHistory.allergies || form.allergies)}</div>
          </div>
          <div class="field">
            <div class="label">Current Medications:</div>
            <div class="value">${formatValue(formData.medicalHistory.medications || form.medications)}</div>
          </div>
          <div class="field">
            <div class="label">Medical Conditions:</div>
            <div class="value">${formatValue(formData.medicalHistory.conditions || form.skinConditions)}</div>
          </div>
        </div>
      ` : ''}
      
      ${formData?.emergencyContact ? `
        <div class="section">
          <div class="section-title">Emergency Contact</div>
          <div class="field">
            <div class="value">${typeof formData.emergencyContact === 'object' 
              ? formatValue(formData.emergencyContact) 
              : formData.emergencyContact || form.emergencyContact || 'Not provided'}</div>
          </div>
        </div>
      ` : ''}
      
      <div class="consent-statement">
        <h3>✓ Consent Acknowledgment</h3>
        <p><strong>I, ${formData?.clientName || form.clientName},</strong> acknowledge that I have:</p>
        <ul>
          <li>Reviewed and understood the ${template.name}</li>
          <li>Provided accurate medical and personal information</li>
          <li>Had the opportunity to ask questions about the procedure</li>
          <li>Understood the risks, benefits, and aftercare instructions</li>
          <li>Voluntarily consent to the PMU procedure described</li>
        </ul>
        ${formData?.consentAcknowledged || formData?.consentGiven ? '<p><strong>✓ Full Consent Given</strong></p>' : ''}
        ${formData?.photographyConsent || formData?.photoConsent ? '<p><strong>✓ Photography/Marketing Consent Given</strong></p>' : ''}
      </div>
      
      ${form.clientSignature || formData?.clientSignature ? `
        <div class="signature-section">
          <h3>Digital Signature</h3>
          <div class="signature-box">
            <p><strong>Client Signature:</strong></p>
            <img src="${form.clientSignature || formData.clientSignature}" alt="Client Signature" />
            <p style="margin-top: 15px;"><strong>Date Signed:</strong> ${form.completedAt ? new Date(form.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
            <p><strong>IP Address:</strong> ${formData?.ipAddress || 'Not recorded'}</p>
          </div>
        </div>
      ` : ''}
      
      <div class="footer">
        <div class="completed-badge">✓ FORM COMPLETED & SIGNED</div>
        <p>Form ID: ${form.id}</p>
        <p>Form Type: ${template.name}</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p style="margin-top: 15px; color: #6B46C1; font-weight: bold;">PMU Guide - Professional Management Platform</p>
        <p style="margin-top: 20px;">
          <button onclick="window.print()" style="padding: 12px 30px; background: #6B46C1; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold;">
            🖨️ Print / Save as PDF
          </button>
        </p>
      </div>
    </body>
    </html>
  `
  
  return htmlContent
}
