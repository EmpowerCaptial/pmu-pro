import { PDFDocument, PDFForm, rgb, StandardFonts } from 'pdf-lib'

export interface GeneratedSignature {
  id: string
  signatureImage: string // Base64 encoded signature image
  signatureText: string
  timestamp: Date
  clientId: string
}

export interface SignatureData {
  clientName: string
  signatureStyle: 'cursive' | 'print' | 'stylized'
  fontSize: number
  color: string
}

export class SignatureGenerationService {
  private static instance: SignatureGenerationService

  static getInstance(): SignatureGenerationService {
    if (!SignatureGenerationService.instance) {
      SignatureGenerationService.instance = new SignatureGenerationService()
    }
    return SignatureGenerationService.instance
  }

  // Generate signature from text input
  async generateSignature(signatureData: SignatureData): Promise<GeneratedSignature> {
    try {
      console.log('SignatureGeneration: Generating signature for:', signatureData.clientName)
      
      const signatureId = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Create signature image using canvas
      const signatureImage = await this.createSignatureImage(signatureData)
      
      const generatedSignature: GeneratedSignature = {
        id: signatureId,
        signatureImage,
        signatureText: signatureData.clientName,
        timestamp: new Date(),
        clientId: '' // Will be set when saving to client profile
      }
      
      console.log('SignatureGeneration: Signature generated successfully')
      return generatedSignature
    } catch (error) {
      console.error('SignatureGeneration: Error generating signature:', error)
      throw new Error('Failed to generate signature')
    }
  }

  // Create signature image using HTML5 Canvas
  private async createSignatureImage(signatureData: SignatureData): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Create canvas element
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        // Set canvas size
        canvas.width = 300
        canvas.height = 100
        
        // Set background (transparent)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Configure text style based on signature style
        this.configureSignatureStyle(ctx, signatureData)
        
        // Calculate text position (centered)
        const textWidth = ctx.measureText(signatureData.clientName).width
        const x = (canvas.width - textWidth) / 2
        const y = canvas.height / 2 + 10 // Slightly below center
        
        // Draw signature text
        ctx.fillText(signatureData.clientName, x, y)
        
        // Convert to base64
        const signatureImage = canvas.toDataURL('image/png')
        resolve(signatureImage)
      } catch (error) {
        reject(error)
      }
    })
  }

  // Configure canvas context for different signature styles
  private configureSignatureStyle(ctx: CanvasRenderingContext2D, signatureData: SignatureData) {
    const { signatureStyle, fontSize, color } = signatureData
    
    // Parse color
    const colorValue = this.parseColor(color)
    
    switch (signatureStyle) {
      case 'cursive':
        ctx.font = `italic ${fontSize}px cursive`
        ctx.fillStyle = colorValue
        break
      case 'print':
        ctx.font = `${fontSize}px Arial`
        ctx.fillStyle = colorValue
        break
      case 'stylized':
        ctx.font = `bold ${fontSize}px Georgia`
        ctx.fillStyle = colorValue
        // Add some rotation for stylized effect
        ctx.save()
        ctx.translate(150, 50)
        ctx.rotate(-0.1) // Slight rotation
        break
      default:
        ctx.font = `${fontSize}px Arial`
        ctx.fillStyle = colorValue
    }
  }

  // Parse color string to canvas-compatible format
  private parseColor(color: string): string {
    if (color.startsWith('#')) {
      return color
    }
    
    // Convert named colors to hex
    const colorMap: Record<string, string> = {
      'black': '#000000',
      'blue': '#0000FF',
      'red': '#FF0000',
      'green': '#008000',
      'purple': '#800080',
      'brown': '#A52A2A',
      'darkblue': '#00008B'
    }
    
    return colorMap[color.toLowerCase()] || '#000000'
  }

  // Add signature to PDF field
  async addSignatureToPDF(
    pdfBuffer: Buffer | Uint8Array,
    signatureField: any,
    signatureImage: string
  ): Promise<Uint8Array> {
    try {
      console.log('SignatureGeneration: Adding signature to PDF field')
      
      const pdfDoc = await PDFDocument.load(pdfBuffer as Uint8Array)
      const form = pdfDoc.getForm()
      
      // Get the signature field
      const field = form.getField(signatureField.name)
      
      if (field) {
        // For now, we'll skip form field signing since it's complex
        // and focus on coordinate-based signing
        console.log('SignatureGeneration: Form field found, but using coordinate-based signing')
      }
      
      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save()
      return modifiedPdfBytes
    } catch (error) {
      console.error('SignatureGeneration: Error adding signature to PDF:', error)
      throw new Error('Failed to add signature to PDF')
    }
  }

  // Convert base64 string to bytes
  private base64ToBytes(base64: string): Uint8Array {
    const binaryString = atob(base64.split(',')[1])
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  // Add signature to specific coordinates in PDF
  async addSignatureToCoordinates(
    pdfBuffer: Buffer | Uint8Array,
    x: number,
    y: number,
    width: number,
    height: number,
    signatureImage: string,
    pageIndex: number = 0
  ): Promise<Uint8Array> {
    try {
      console.log('SignatureGeneration: Adding signature to coordinates:', { x, y, width, height })
      
      const pdfDoc = await PDFDocument.load(pdfBuffer as Uint8Array)
      const pages = pdfDoc.getPages()
      
      if (pageIndex >= pages.length) {
        throw new Error('Page index out of range')
      }
      
      const page = pages[pageIndex]
      
      // Convert base64 image to PDF image
      const imageBytes = this.base64ToBytes(signatureImage)
      const image = await pdfDoc.embedPng(imageBytes)
      
      // Calculate image dimensions to fit the signature area
      const imageAspectRatio = image.width / image.height
      const areaAspectRatio = width / height
      
      let drawWidth = width
      let drawHeight = height
      
      if (imageAspectRatio > areaAspectRatio) {
        // Image is wider than area, fit to width
        drawHeight = width / imageAspectRatio
      } else {
        // Image is taller than area, fit to height
        drawWidth = height * imageAspectRatio
      }
      
      // Center the image in the signature area
      const drawX = x + (width - drawWidth) / 2
      const drawY = y + (height - drawHeight) / 2
      
      // Draw the signature image
      page.drawImage(image, {
        x: drawX,
        y: drawY,
        width: drawWidth,
        height: drawHeight
      })
      
      console.log('SignatureGeneration: Signature added to coordinates successfully')
      
      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save()
      return modifiedPdfBytes
    } catch (error) {
      console.error('SignatureGeneration: Error adding signature to coordinates:', error)
      throw new Error('Failed to add signature to PDF coordinates')
    }
  }

  // Save signature to client profile
  async saveSignatureToClient(
    clientId: string,
    signature: GeneratedSignature
  ): Promise<void> {
    try {
      console.log('SignatureGeneration: Saving signature to client profile:', clientId)
      
      // Get existing signatures from localStorage
      const existingSignatures = this.getClientSignatures(clientId)
      
      // Add new signature
      const updatedSignatures = [...existingSignatures, {
        ...signature,
        clientId
      }]
      
      // Save back to localStorage
      localStorage.setItem(`client_signatures_${clientId}`, JSON.stringify(updatedSignatures))
      
      console.log('SignatureGeneration: Signature saved to client profile')
    } catch (error) {
      console.error('SignatureGeneration: Error saving signature to client:', error)
      throw new Error('Failed to save signature to client profile')
    }
  }

  // Get client signatures from localStorage
  getClientSignatures(clientId: string): GeneratedSignature[] {
    try {
      const stored = localStorage.getItem(`client_signatures_${clientId}`)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('SignatureGeneration: Error loading client signatures:', error)
      return []
    }
  }

  // Get latest signature for client
  getLatestSignature(clientId: string): GeneratedSignature | null {
    const signatures = this.getClientSignatures(clientId)
    return signatures.length > 0 ? signatures[signatures.length - 1] : null
  }
}

export default SignatureGenerationService
