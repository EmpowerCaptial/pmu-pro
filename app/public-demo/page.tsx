'use client'

import React, { useState, useEffect } from 'react'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export default function PublicDemoPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [signatureText, setSignatureText] = useState('')
  const [signatureStyle, setSignatureStyle] = useState('cursive')
  const [showSignatureModal, setShowSignatureModal] = useState(false)

  const generateSamplePDF = async () => {
    setIsGenerating(true)
    try {
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([612, 792])
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      const { width, height } = page.getSize()
      const margin = 50
      const lineHeight = 20
      let y = height - margin

      // Title
      page.drawText('DEMO CONSENT FORM', {
        x: margin,
        y,
        size: 18,
        font: boldFont,
        color: rgb(0, 0, 0)
      })
      y -= lineHeight * 2

      // Content
      page.drawText('This is a demo PDF for testing the signature system.', {
        x: margin,
        y,
        size: 12,
        font,
        color: rgb(0, 0, 0)
      })
      y -= lineHeight * 2

      page.drawText('I consent to the treatment and understand the risks.', {
        x: margin,
        y,
        size: 12,
        font,
        color: rgb(0, 0, 0)
      })
      y -= lineHeight * 2

      // Signature Area
      page.drawText('Signature:', {
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
      const url = URL.createObjectURL(new Blob([Buffer.from(pdfBytes)], { type: 'application/pdf' }))
      setPdfUrl(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateSignature = () => {
    if (!signatureText.trim()) return null

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    canvas.width = 300
    canvas.height = 100

    // Set background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Set font style
    const fontSize = signatureStyle === 'cursive' ? 24 : 20
    const fontFamily = signatureStyle === 'cursive' ? 'Brush Script MT, cursive' : 'Arial, sans-serif'
    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.fillStyle = '#000'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    // Add some randomness for natural look
    const y = 50 + (Math.random() - 0.5) * 10
    ctx.fillText(signatureText, 20, y)

    return canvas.toDataURL()
  }

  const handleSign = () => {
    setShowSignatureModal(true)
  }

  const handleSignatureSubmit = () => {
    const signatureImage = generateSignature()
    if (signatureImage) {
      console.log('Signature generated:', signatureImage.substring(0, 50) + '...')
      alert('Signature generated successfully! In a real app, this would be applied to the PDF.')
    }
    setShowSignatureModal(false)
    setSignatureText('')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Public PDF Signature Demo</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This is a standalone demo that works without any authentication requirements.
          Test PDF generation and signature creation directly in your browser.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* PDF Generation */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 1: Generate PDF</h2>
          <button
            onClick={generateSamplePDF}
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating PDF...' : 'Generate Sample PDF'}
          </button>
          
          {pdfUrl && (
            <div className="space-y-2">
              <h3 className="font-medium">Generated PDF:</h3>
              <iframe
                src={pdfUrl}
                className="w-full h-96 border border-gray-300 rounded-lg"
                title="Generated PDF"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSign}
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Sign Document
                </button>
                <a
                  href={pdfUrl}
                  download="demo-consent-form.pdf"
                  className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                >
                  Download PDF
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Signature Generation */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 2: Create Signature</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Signature Text:</label>
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Signature Style:</label>
              <select
                value={signatureStyle}
                onChange={(e) => setSignatureStyle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="cursive">Cursive</option>
                <option value="print">Print</option>
              </select>
            </div>

            <button
              onClick={() => setShowSignatureModal(true)}
              disabled={!signatureText.trim()}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Generate Signature
            </button>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Generate Signature</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name:</label>
                <input
                  type="text"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Style:</label>
                <select
                  value={signatureStyle}
                  onChange={(e) => setSignatureStyle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="cursive">Cursive</option>
                  <option value="print">Print</option>
                </select>
              </div>

              {signatureText && (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="text-center">
                    <span className={`text-xl ${signatureStyle === 'cursive' ? 'italic' : ''}`}>
                      {signatureText}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSignatureSubmit}
                disabled={!signatureText.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Generate
              </button>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">How This Works:</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">1️⃣</div>
            <h4 className="font-medium mb-2">Generate PDF</h4>
            <p className="text-sm text-gray-600">
              Creates a sample consent form PDF directly in your browser using pdf-lib
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">2️⃣</div>
            <h4 className="font-medium mb-2">Create Signature</h4>
            <p className="text-sm text-gray-600">
              Type your name and choose a style to generate a digital signature
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">3️⃣</div>
            <h4 className="font-medium mb-2">Apply & Save</h4>
            <p className="text-sm text-gray-600">
              Signatures are applied to the PDF and can be downloaded
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-100 rounded">
          <p className="text-sm">
            <strong>Note:</strong> This demo works completely offline and doesn't require any server authentication. 
            It's perfect for testing the signature system without any deployment protection issues.
          </p>
        </div>
      </div>
    </div>
  )
}

