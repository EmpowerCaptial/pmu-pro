'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`
import SignatureDetectionService, { SignatureField, SignatureArea } from '@/lib/signature-detection-service'
import SignatureGenerationService, { SignatureData } from '@/lib/signature-generation-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PenTool, Download, Eye, CheckCircle, AlertCircle } from 'lucide-react'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface SmartPDFSignatureViewerProps {
  pdfUrl: string
  templateType?: 'consent-form' | 'medical-history' | 'treatment-plan'
  clientId: string
  onDocumentSigned?: (signedPdfBuffer: Buffer | Uint8Array) => void
  onSignatureFieldsDetected?: (fields: any[]) => void
  isReviewMode?: boolean
}

interface SignatureFieldIndicatorProps {
  field: SignatureField
  onSign: (field: SignatureField) => void
  isSigned: boolean
}

interface SignatureAreaIndicatorProps {
  area: SignatureArea
  onSign: (area: SignatureArea) => void
  isSigned: boolean
}

export function SmartPDFSignatureViewer({
  pdfUrl,
  templateType,
  clientId,
  onDocumentSigned,
  onSignatureFieldsDetected,
  isReviewMode = false
}: SmartPDFSignatureViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([])
  const [signatureAreas, setSignatureAreas] = useState<SignatureArea[]>([])
  const [signedFields, setSignedFields] = useState<Set<string>>(new Set())
  const [pdfBuffer, setPdfBuffer] = useState<Buffer | Uint8Array | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [currentSignatureTarget, setCurrentSignatureTarget] = useState<SignatureField | SignatureArea | null>(null)
  const [signatureData, setSignatureData] = useState<SignatureData>({
    clientName: '',
    signatureStyle: 'cursive',
    fontSize: 24,
    color: 'black'
  })

  const signatureDetectionService = SignatureDetectionService.getInstance()
  const signatureGenerationService = SignatureGenerationService.getInstance()

  useEffect(() => {
    loadPDFAndDetectSignatures()
  }, [pdfUrl, templateType])

  const loadPDFAndDetectSignatures = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('SmartPDFViewer: Loading PDF and detecting signatures...')
      
      // Fetch PDF buffer
      const response = await fetch(pdfUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/pdf')) {
        console.warn('SmartPDFViewer: Response is not a PDF:', contentType)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      // Validate PDF header
      const pdfHeader = new TextDecoder().decode(buffer.slice(0, 8))
      if (!pdfHeader.startsWith('%PDF-')) {
        throw new Error('Invalid PDF format - missing PDF header')
      }
      
      setPdfBuffer(buffer)

      // Detect signature areas
      const { fields, areas } = await signatureDetectionService.detectSignatureAreas(buffer, templateType)
      
      setSignatureFields(fields)
      setSignatureAreas(areas)
      
      // Notify parent component about detected fields
      if (onSignatureFieldsDetected) {
        const allFields = [...fields, ...areas]
        onSignatureFieldsDetected(allFields)
      }
      
      console.log('SmartPDFViewer: Detection complete -', fields.length, 'fields,', areas.length, 'areas')
      
      setIsLoading(false)
    } catch (error) {
      console.error('SmartPDFViewer: Error loading PDF:', error)
      setError(`Failed to load PDF document: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsLoading(false)
    }
  }

  const handleSignature = async (target: SignatureField | SignatureArea) => {
    console.log('SmartPDFViewer: Handling signature for:', target)
    setCurrentSignatureTarget(target)
    setShowSignatureModal(true)
  }

  const handleSignatureSubmit = async () => {
    if (!currentSignatureTarget || !signatureData.clientName.trim() || !pdfBuffer) {
      return
    }

    try {
      console.log('SmartPDFViewer: Generating and applying signature...')
      
      // Generate signature
      const generatedSignature = await signatureGenerationService.generateSignature(signatureData)
      
      // Save to client profile
      await signatureGenerationService.saveSignatureToClient(clientId, generatedSignature)
      
      // Add signature to PDF
      let modifiedPdfBuffer: Buffer | Uint8Array
      
      if ('name' in currentSignatureTarget) {
        // It's a SignatureField
        modifiedPdfBuffer = await signatureGenerationService.addSignatureToPDF(
          pdfBuffer,
          currentSignatureTarget,
          generatedSignature.signatureImage
        )
      } else {
        // It's a SignatureArea
        modifiedPdfBuffer = await signatureGenerationService.addSignatureToCoordinates(
          pdfBuffer,
          currentSignatureTarget.x,
          currentSignatureTarget.y,
          currentSignatureTarget.width,
          currentSignatureTarget.height,
          generatedSignature.signatureImage,
          currentSignatureTarget.page - 1
        )
      }
      
      // Update signed fields
      const targetId = 'name' in currentSignatureTarget ? currentSignatureTarget.name : currentSignatureTarget.id
      setSignedFields(prev => new Set([...prev, targetId]))
      
      // Update PDF buffer
      setPdfBuffer(modifiedPdfBuffer)
      
      // Close modal
      setShowSignatureModal(false)
      setCurrentSignatureTarget(null)
      setSignatureData({ ...signatureData, clientName: '' })
      
      // Notify parent component
      if (onDocumentSigned) {
        onDocumentSigned(modifiedPdfBuffer)
      }
      
      console.log('SmartPDFViewer: Signature applied successfully')
    } catch (error) {
      console.error('SmartPDFViewer: Error applying signature:', error)
      setError('Failed to apply signature')
    }
  }

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const downloadSignedPDF = () => {
    if (!pdfBuffer) return
    
    const blob = new Blob([Buffer.from(pdfBuffer)], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `signed-document-${Date.now()}.pdf`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF and detecting signature areas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <Button onClick={loadPDFAndDetectSignatures} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const totalSignatureAreas = signatureFields.length + signatureAreas.length
  const signedCount = signedFields.size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Document Signature</h2>
          <p className="text-gray-600">
            {signedCount} of {totalSignatureAreas} signature areas completed
          </p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant={signedCount === totalSignatureAreas ? "default" : "secondary"}>
            {signedCount}/{totalSignatureAreas} Signed
          </Badge>
          
          {signedCount > 0 && !isReviewMode && (
            <Button onClick={downloadSignedPDF} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Signed PDF
            </Button>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="relative border rounded-lg overflow-hidden">
        {isReviewMode && (
          <div className="bg-blue-50 border-b border-blue-200 p-3">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Review Mode</span>
              <span className="text-sm text-blue-700">- Detecting signature fields automatically</span>
            </div>
          </div>
        )}
        
        <Document
          file={pdfBuffer ? { data: pdfBuffer } : pdfUrl}
          onLoadSuccess={handleDocumentLoadSuccess}
          className="max-w-full"
        >
          <Page
            pageNumber={currentPage}
            width={800}
            className="mx-auto"
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>

        {/* Signature Field Indicators - Only show in review mode */}
        {isReviewMode && signatureFields.map(field => (
          <SignatureFieldIndicator
            key={field.id}
            field={field}
            onSign={() => {}} // No action in review mode
            isSigned={false}
          />
        ))}

        {/* Signature Area Indicators - Only show in review mode */}
        {isReviewMode && signatureAreas.map(area => (
          <SignatureAreaIndicator
            key={area.id}
            area={area}
            onSign={() => {}} // No action in review mode
            isSigned={false}
          />
        ))}
      </div>

      {/* Page Navigation */}
      {numPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            variant="outline"
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {numPages}
          </span>
          
          <Button
            onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
            disabled={currentPage >= numPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}

      {/* Signature Modal - Only show when not in review mode */}
      {!isReviewMode && (
        <Dialog open={showSignatureModal} onOpenChange={setShowSignatureModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Your Signature</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientName">Your Name</Label>
              <Input
                id="clientName"
                value={signatureData.clientName}
                onChange={(e) => setSignatureData(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <Label htmlFor="signatureStyle">Signature Style</Label>
              <Select
                value={signatureData.signatureStyle}
                onValueChange={(value: 'cursive' | 'print' | 'stylized') => 
                  setSignatureData(prev => ({ ...prev, signatureStyle: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cursive">Cursive</SelectItem>
                  <SelectItem value="print">Print</SelectItem>
                  <SelectItem value="stylized">Stylized</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="fontSize">Font Size</Label>
              <Select
                value={signatureData.fontSize.toString()}
                onValueChange={(value) => 
                  setSignatureData(prev => ({ ...prev, fontSize: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="18">Small (18px)</SelectItem>
                  <SelectItem value="24">Medium (24px)</SelectItem>
                  <SelectItem value="32">Large (32px)</SelectItem>
                  <SelectItem value="40">Extra Large (40px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="color">Color</Label>
              <Select
                value={signatureData.color}
                onValueChange={(value) => 
                  setSignatureData(prev => ({ ...prev, color: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="darkblue">Dark Blue</SelectItem>
                  <SelectItem value="brown">Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => setShowSignatureModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSignatureSubmit}
              disabled={!signatureData.clientName.trim()}
              className="flex-1"
            >
              <PenTool className="h-4 w-4 mr-2" />
              Sign Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      )}
    </div>
  )
}

// Signature Field Indicator Component
function SignatureFieldIndicator({ field, onSign, isSigned }: SignatureFieldIndicatorProps) {
  return (
    <div
      className={`absolute cursor-pointer transition-all duration-200 ${
        isSigned ? 'opacity-60' : 'opacity-100 hover:opacity-80'
      }`}
      style={{
        left: `${field.x}px`,
        top: `${field.y}px`,
        width: `${field.width}px`,
        height: `${field.height}px`,
        border: isSigned ? '2px solid #10b981' : '2px dashed #3b82f6',
        backgroundColor: isSigned ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        borderRadius: '4px',
        animation: isSigned ? 'none' : 'pulse 2s infinite'
      }}
      onClick={() => !isSigned && onSign(field)}
    >
      <div className="absolute -top-6 left-0 bg-white px-2 py-1 rounded text-xs font-medium border">
        {isSigned ? (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-3 w-3" />
            {field.label}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-blue-600">
            <PenTool className="h-3 w-3" />
            {field.label}
          </div>
        )}
      </div>
    </div>
  )
}

// Signature Area Indicator Component
function SignatureAreaIndicator({ area, onSign, isSigned }: SignatureAreaIndicatorProps) {
  return (
    <div
      className={`absolute cursor-pointer transition-all duration-200 ${
        isSigned ? 'opacity-60' : 'opacity-100 hover:opacity-80'
      }`}
      style={{
        left: `${area.x}px`,
        top: `${area.y}px`,
        width: `${area.width}px`,
        height: `${area.height}px`,
        border: isSigned ? '2px solid #10b981' : '2px dashed #3b82f6',
        backgroundColor: isSigned ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        borderRadius: '4px',
        animation: isSigned ? 'none' : 'pulse 2s infinite'
      }}
      onClick={() => !isSigned && onSign(area)}
    >
      <div className="absolute -top-6 left-0 bg-white px-2 py-1 rounded text-xs font-medium border">
        {isSigned ? (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-3 w-3" />
            {area.label}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-blue-600">
            <PenTool className="h-3 w-3" />
            {area.label}
          </div>
        )}
      </div>
    </div>
  )
}

export default SmartPDFSignatureViewer
