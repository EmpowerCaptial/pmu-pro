"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  PenTool, 
  CheckCircle,
  AlertTriangle,
  Download,
  Send,
  User,
  Calendar,
  Clock
} from 'lucide-react'

interface SignatureRequest {
  token: string
  documentTitle: string
  documentUrl: string
  artistName: string
  personalMessage?: string
  createdAt: Date
  expiresAt: Date
}

interface SignatureData {
  clientName: string
  clientEmail: string
  signature: string
  signedAt: Date
}

export default function SignaturePage() {
  const params = useParams()
  const token = params.token as string

  const [signatureRequest, setSignatureRequest] = useState<SignatureRequest | null>(null)
  const [signatureData, setSignatureData] = useState<SignatureData>({
    clientName: '',
    clientEmail: '',
    signature: '',
    signedAt: new Date()
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSigning, setIsSigning] = useState(false)
  const [isSigned, setIsSigned] = useState(false)

  useEffect(() => {
    if (token) {
      loadSignatureRequest(token)
    }
  }, [token])

  const loadSignatureRequest = async (signatureToken: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch signature request from API
      const response = await fetch(`/api/signature-requests?token=${signatureToken}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to load signature request')
      }

      const signatureRequestData = await response.json()
      console.log('Loaded signature request:', signatureRequestData)
      setSignatureRequest(signatureRequestData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load signature request. Please check the link or contact your PMU artist.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignatureData({ ...signatureData, signature: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!signatureData.clientName.trim() || !signatureData.clientEmail.trim() || !signatureData.signature.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    try {
      setIsSigning(true)
      setError(null)

      // Submit signature to API
      const response = await fetch('/api/signature-requests/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          clientName: signatureData.clientName,
          clientEmail: signatureData.clientEmail,
          signature: signatureData.signature
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit signature')
      }

      const result = await response.json()
      setIsSigned(true)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit signature. Please try again.')
    } finally {
      setIsSigning(false)
    }
  }

  const downloadDocument = () => {
    if (signatureRequest?.documentUrl) {
      window.open(signatureRequest.documentUrl, '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender mx-auto mb-4"></div>
          <p className="text-gray-600">Loading signature request...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Signature Request Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
            <p className="text-sm text-gray-600 text-center">
              Please contact your PMU artist for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSigned) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Document Signed Successfully!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Thank you for signing the document. Your PMU artist has been notified.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Signature Confirmed</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Signed by: {signatureData.clientName}
                </p>
                <p className="text-sm text-green-700">
                  Date: {signatureData.signedAt.toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                You can close this window. A copy of the signed document will be sent to your email.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-lavender to-purple-500 rounded-full w-16 h-16 flex items-center justify-center">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Signature Request</h1>
          <p className="text-gray-600">Please review and sign the document below</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-lavender" />
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Document Title</Label>
                <p className="text-lg font-semibold text-gray-900">{signatureRequest?.documentTitle}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">From</Label>
                <p className="text-gray-900">{signatureRequest?.artistName}</p>
              </div>

              {signatureRequest?.personalMessage && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Personal Message</Label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {signatureRequest.personalMessage}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {signatureRequest?.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Expires: {signatureRequest?.expiresAt.toLocaleDateString()}</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={downloadDocument}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Document
              </Button>
            </CardContent>
          </Card>

          {/* Signature Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-lavender" />
                Digital Signature
              </CardTitle>
              <CardDescription>
                Please provide your information and digital signature
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Full Name *</Label>
                  <Input
                    id="clientName"
                    value={signatureData.clientName}
                    onChange={(e) => setSignatureData({ ...signatureData, clientName: e.target.value })}
                    placeholder="Enter your full name"
                    required
                    className="bg-white border-gray-300"
                  />
                </div>

                <div>
                  <Label htmlFor="clientEmail">Email Address *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={signatureData.clientEmail}
                    onChange={(e) => setSignatureData({ ...signatureData, clientEmail: e.target.value })}
                    placeholder="Enter your email address"
                    required
                    className="bg-white border-gray-300"
                  />
                </div>

                <div>
                  <Label htmlFor="signature">Digital Signature *</Label>
                  <Input
                    id="signature"
                    value={signatureData.signature}
                    onChange={handleSignatureChange}
                    placeholder="Type your full name as your digital signature"
                    required
                    className="bg-white border-gray-300 font-signature"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    By typing your name above, you agree to sign this document electronically
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Electronic Signature Agreement</p>
                      <p className="mt-1">
                        By signing this document electronically, you consent to be legally bound by this agreement, 
                        just as if you had signed it in writing. Your electronic signature is as valid as a handwritten signature.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-lavender to-purple-500 hover:from-lavender/90 hover:to-purple-500/90"
                  disabled={isSigning}
                >
                  {isSigning ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Signing Document...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Sign Document
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
