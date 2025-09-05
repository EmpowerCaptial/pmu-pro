import { PDFDocument, PDFForm } from 'pdf-lib'

export interface SignatureField {
  id: string
  name: string
  label: string
  x: number
  y: number
  width: number
  height: number
  page: number
  required: boolean
  type: 'signature' | 'date' | 'initials' | 'text'
}

export interface SignatureArea {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  page: number
  confidence: number
  type: 'signature' | 'date' | 'initials' | 'text'
}

export class SignatureDetectionService {
  private static instance: SignatureDetectionService

  static getInstance(): SignatureDetectionService {
    if (!SignatureDetectionService.instance) {
      SignatureDetectionService.instance = new SignatureDetectionService()
    }
    return SignatureDetectionService.instance
  }

  // Detect existing PDF form fields
  async detectFormFields(pdfBuffer: Buffer): Promise<SignatureField[]> {
    try {
      console.log('SignatureDetection: Loading PDF document...')
      const pdfDoc = await PDFDocument.load(pdfBuffer)
      const form = pdfDoc.getForm()
      const fields = form.getFields()
      
      console.log('SignatureDetection: Found', fields.length, 'total form fields')
      
      const signatureFields: SignatureField[] = []
      
      for (const field of fields) {
        if (this.isSignatureField(field)) {
          const signatureField = await this.mapToSignatureField(field)
          signatureFields.push(signatureField)
        }
      }
      
      console.log('SignatureDetection: Detected', signatureFields.length, 'signature fields')
      return signatureFields
    } catch (error) {
      console.error('SignatureDetection: Error detecting form fields:', error)
      return []
    }
  }

  // Check if a field is a signature-related field
  private isSignatureField(field: any): boolean {
    const fieldName = field.getName().toLowerCase()
    const fieldType = field.constructor.name
    
    // Check for signature field types
    if (fieldType === 'PDFSignature') {
      return true
    }
    
    // Check field names for signature-related keywords
    const signatureKeywords = [
      'signature', 'sign', 'sig', 'signature_field',
      'date', 'dated', 'date_signed',
      'initials', 'init', 'initial',
      'client_signature', 'patient_signature',
      'witness_signature', 'guardian_signature'
    ]
    
    return signatureKeywords.some(keyword => fieldName.includes(keyword))
  }

  // Map PDF field to our SignatureField interface
  private async mapToSignatureField(field: any): Promise<SignatureField> {
    const fieldName = field.getName()
    const fieldType = field.constructor.name
    
    // Determine field type based on name and PDF field type
    let type: SignatureField['type'] = 'signature'
    if (fieldName.toLowerCase().includes('date')) {
      type = 'date'
    } else if (fieldName.toLowerCase().includes('initial')) {
      type = 'initials'
    } else if (fieldType === 'PDFText') {
      type = 'text'
    }
    
    // Get field dimensions and position
    const rect = field.acroField.getRectangle()
    const page = field.acroField.getPage()
    
    return {
      id: fieldName,
      name: fieldName,
      label: this.generateFieldLabel(fieldName, type),
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      page: page.index + 1,
      required: field.isRequired(),
      type
    }
  }

  // Generate human-readable label for field
  private generateFieldLabel(fieldName: string, type: SignatureField['type']): string {
    const name = fieldName.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()
    
    switch (type) {
      case 'signature':
        return `Sign Here: ${name}`
      case 'date':
        return `Date: ${name}`
      case 'initials':
        return `Initials: ${name}`
      case 'text':
        return `Text: ${name}`
      default:
        return name
    }
  }

  // Template-based detection for standard documents
  getTemplateSignatureAreas(templateType: string): SignatureArea[] {
    const templates: Record<string, SignatureArea[]> = {
      'consent-form': [
        {
          id: 'client_signature',
          label: 'Client Signature',
          x: 100,
          y: 500,
          width: 200,
          height: 50,
          page: 1,
          confidence: 1.0,
          type: 'signature'
        },
        {
          id: 'date_signed',
          label: 'Date',
          x: 100,
          y: 600,
          width: 100,
          height: 30,
          page: 1,
          confidence: 1.0,
          type: 'date'
        },
        {
          id: 'witness_signature',
          label: 'Witness Signature',
          x: 100,
          y: 700,
          width: 200,
          height: 50,
          page: 1,
          confidence: 1.0,
          type: 'signature'
        }
      ],
      'medical-history': [
        {
          id: 'patient_signature',
          label: 'Patient Signature',
          x: 150,
          y: 400,
          width: 200,
          height: 50,
          page: 1,
          confidence: 1.0,
          type: 'signature'
        },
        {
          id: 'date_completed',
          label: 'Date Completed',
          x: 150,
          y: 500,
          width: 100,
          height: 30,
          page: 1,
          confidence: 1.0,
          type: 'date'
        }
      ],
      'treatment-plan': [
        {
          id: 'client_agreement',
          label: 'Client Agreement Signature',
          x: 120,
          y: 450,
          width: 200,
          height: 50,
          page: 1,
          confidence: 1.0,
          type: 'signature'
        },
        {
          id: 'treatment_date',
          label: 'Treatment Date',
          x: 120,
          y: 550,
          width: 100,
          height: 30,
          page: 1,
          confidence: 1.0,
          type: 'date'
        }
      ]
    }
    
    return templates[templateType] || []
  }

  // AI-powered signature area detection (placeholder for future implementation)
  async detectSignatureAreasWithAI(pdfImage: string): Promise<SignatureArea[]> {
    try {
      console.log('SignatureDetection: Using AI to detect signature areas...')
      
      // This would integrate with AI vision services
      // For now, return empty array - will be implemented in Phase 2
      return []
    } catch (error) {
      console.error('SignatureDetection: AI detection error:', error)
      return []
    }
  }

  // Main detection method that tries all approaches
  async detectSignatureAreas(
    pdfBuffer: Buffer, 
    templateType?: string
  ): Promise<{ fields: SignatureField[], areas: SignatureArea[] }> {
    console.log('SignatureDetection: Starting signature area detection...')
    
    // Try PDF form fields first
    const fields = await this.detectFormFields(pdfBuffer)
    
    // If no form fields found, try template-based detection
    let areas: SignatureArea[] = []
    if (fields.length === 0 && templateType) {
      console.log('SignatureDetection: No form fields found, using template detection')
      areas = this.getTemplateSignatureAreas(templateType)
    }
    
    // Future: Add AI detection as fallback
    // if (fields.length === 0 && areas.length === 0) {
    //   areas = await this.detectSignatureAreasWithAI(pdfImage)
    // }
    
    console.log('SignatureDetection: Detection complete -', fields.length, 'fields,', areas.length, 'areas')
    
    return { fields, areas }
  }
}

export default SignatureDetectionService
