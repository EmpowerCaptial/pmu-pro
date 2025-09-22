'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const SmartPDFSignatureViewer = dynamic(
  () => import('@/components/documents/smart-pdf-signature-viewer'),
  { ssr: false }
)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Eye, PenTool } from 'lucide-react'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const sampleDocuments = [
  {
    id: 'consent-form',
    name: 'Consent Form',
    description: 'Standard treatment consent form with signature fields',
    templateType: 'consent-form' as const
  },
  {
    id: 'medical-history',
    name: 'Medical History Form',
    description: 'Comprehensive medical history questionnaire',
    templateType: 'medical-history' as const
  },
  {
    id: 'treatment-plan',
    name: 'Treatment Plan',
    description: 'Customized treatment plan with client agreement',
    templateType: 'treatment-plan' as const
  }
]

// Client-side PDF generation functions
async function generateSampleConsentForm(): Promise<string> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const { width, height } = page.getSize()
  const margin = 50
  const lineHeight = 20
  let y = height - margin

  // Title
  page.drawText('TREATMENT CONSENT FORM', {
    x: margin,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Client Information
  page.drawText('Client Information:', {
    x: margin,
    y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('Name: _________________________________', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('Date: _________________________________', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Consent Text
  page.drawText('I, the undersigned, hereby consent to receive permanent makeup treatment.', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('I understand that this is a semi-permanent procedure and results may vary.', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Signature Areas
  page.drawText('Client Signature:', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  // Signature box
  page.drawRectangle({
    x: margin,
    y: y - 50,
    width: 200,
    height: 50,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
    color: rgb(0.95, 0.95, 0.95)
  })

  y -= lineHeight * 4

  page.drawText('Date:', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  // Date box
  page.drawRectangle({
    x: margin,
    y: y - 30,
    width: 100,
    height: 30,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
    color: rgb(0.95, 0.95, 0.95)
  })

  const pdfBytes = await pdfDoc.save()
  return URL.createObjectURL(new Blob([Buffer.from(pdfBytes)], { type: 'application/pdf' }))
}

async function generateSampleMedicalHistory(): Promise<string> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const { width, height } = page.getSize()
  const margin = 50
  const lineHeight = 20
  let y = height - margin

  // Title
  page.drawText('MEDICAL HISTORY FORM', {
    x: margin,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Patient Information
  page.drawText('Patient Information:', {
    x: margin,
    y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('Name: _________________________________', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('Date of Birth: _________________________', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Medical Questions
  page.drawText('Medical History Questions:', {
    x: margin,
    y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  const questions = [
    'Do you have any allergies?',
    'Are you currently taking any medications?',
    'Do you have any skin conditions?',
    'Have you had any previous permanent makeup?',
    'Do you have any bleeding disorders?',
    'Are you pregnant or nursing?'
  ]

  questions.forEach(question => {
    page.drawText(`□ ${question}`, {
      x: margin,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0)
    })
    y -= lineHeight
  })

  y -= lineHeight * 2

  // Signature
  page.drawText('Patient Signature:', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  // Signature box
  page.drawRectangle({
    x: margin,
    y: y - 50,
    width: 200,
    height: 50,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
    color: rgb(0.95, 0.95, 0.95)
  })

  y -= lineHeight * 4

  page.drawText('Date Completed:', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  // Date box
  page.drawRectangle({
    x: margin,
    y: y - 30,
    width: 100,
    height: 30,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
    color: rgb(0.95, 0.95, 0.95)
  })

  const pdfBytes = await pdfDoc.save()
  return URL.createObjectURL(new Blob([Buffer.from(pdfBytes)], { type: 'application/pdf' }))
}

async function generateSampleTreatmentPlan(): Promise<string> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const { width, height } = page.getSize()
  const margin = 50
  const lineHeight = 20
  let y = height - margin

  // Title
  page.drawText('TREATMENT PLAN', {
    x: margin,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Client Information
  page.drawText('Client: _________________________________', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Treatment Details
  page.drawText('Recommended Treatment:', {
    x: margin,
    y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('□ Microblading Eyebrows', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('□ Eyeliner Enhancement', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('□ Lip Liner/Blush', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  page.drawText('Estimated Cost: $_________________', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  page.drawText('Treatment Date: _________________', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Agreement
  page.drawText('I agree to the above treatment plan and understand the associated costs.', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Signature
  page.drawText('Client Agreement Signature:', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  // Signature box
  page.drawRectangle({
    x: margin,
    y: y - 50,
    width: 200,
    height: 50,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
    color: rgb(0.95, 0.95, 0.95)
  })

  y -= lineHeight * 4

  page.drawText('Treatment Date:', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  // Date box
  page.drawRectangle({
    x: margin,
    y: y - 30,
    width: 100,
    height: 30,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
    color: rgb(0.95, 0.95, 0.95)
  })

  const pdfBytes = await pdfDoc.save()
  return URL.createObjectURL(new Blob([Buffer.from(pdfBytes)], { type: 'application/pdf' }))
}

export default function SignatureDemoPage() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [clientId] = useState('demo-client-123')
  const [isClient, setIsClient] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const handleDocumentSigned = (signedPdfBuffer: Buffer | Uint8Array) => {
    console.log('Demo: Document signed successfully')
    // In a real app, you would save this to your database
    // For demo purposes, we'll just log it
  }

  const generatePDF = async (docType: string) => {
    setIsGenerating(true)
    try {
      let url: string
      switch (docType) {
        case 'consent-form':
          url = await generateSampleConsentForm()
          break
        case 'medical-history':
          url = await generateSampleMedicalHistory()
          break
        case 'treatment-plan':
          url = await generateSampleTreatmentPlan()
          break
        default:
          throw new Error('Unknown document type')
      }
      setPdfUrl(url)
      setSelectedDocument(docType)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Show loading state while client-side rendering
  if (!isClient) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading signature system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">PDF Signature System Demo</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Test the automatic signature field detection and digital signature generation system. 
          The system can detect PDF form fields and template-based signature areas.
        </p>
      </div>

      {!selectedDocument ? (
        <div className="grid md:grid-cols-3 gap-6">
          {sampleDocuments.map((doc) => (
            <Card 
              key={doc.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => generatePDF(doc.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{doc.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {doc.templateType}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  {doc.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Eye className="h-4 w-4" />
                  <span>Click to generate and sign</span>
                </div>
                {isGenerating && doc.id === selectedDocument && (
                  <div className="mt-4 text-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-xs text-gray-500 mt-2">Generating PDF...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedDocument(null)
                if (pdfUrl) {
                  URL.revokeObjectURL(pdfUrl)
                  setPdfUrl(null)
                }
              }}
            >
              ← Back to Documents
            </Button>
            
            <div className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-blue-600" />
              <span className="font-medium">
                {sampleDocuments.find(d => d.id === selectedDocument)?.name}
              </span>
            </div>
          </div>

          {pdfUrl && (
            <SmartPDFSignatureViewer
              pdfUrl={pdfUrl}
              templateType={sampleDocuments.find(d => d.id === selectedDocument)?.templateType}
              clientId={clientId}
              onDocumentSigned={handleDocumentSigned}
            />
          )}
        </div>
      )}

      {/* Demo Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">1️⃣</div>
              <h3 className="font-semibold mb-2">Generate PDF</h3>
              <p className="text-sm text-gray-600">
                Click on a document type to generate a PDF with signature fields on the client side.
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">2️⃣</div>
              <h3 className="font-semibold mb-2">Signature Generation</h3>
              <p className="text-sm text-gray-600">
                Type your name and choose signature style to generate a personalized signature.
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">3️⃣</div>
              <h3 className="font-semibold mb-2">Document Completion</h3>
              <p className="text-sm text-gray-600">
                Signatures are automatically placed in the correct locations and the signed document is saved.
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold mb-2">Demo Notes:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• PDFs are generated on the client side to avoid API authentication issues</li>
              <li>• The system uses template-based signature detection for demo purposes</li>
              <li>• Signatures are saved to the client profile and can be reused</li>
              <li>• The system supports multiple signature styles and customization options</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
