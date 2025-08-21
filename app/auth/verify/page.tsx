"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function MagicLinkVerificationContent() {
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setVerificationStatus('error')
      setErrorMessage('Invalid magic link. No token provided.')
      return
    }

    verifyMagicLink(token)
  }, [searchParams])

  const verifyMagicLink = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        const data = await response.json()
        setVerificationStatus('success')
        setUserEmail(data.email)
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        const errorData = await response.json()
        setVerificationStatus('error')
        setErrorMessage(errorData.message || 'Verification failed')
      }
    } catch (error) {
      setVerificationStatus('error')
      setErrorMessage('Network error. Please try again.')
    }
  }

  const handleRetry = () => {
    router.push('/auth/login')
  }

  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-lavender/30 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-lavender/10 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-lavender animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verifying Your Sign In
            </CardTitle>
            <CardDescription className="text-gray-600">
              Please wait while we verify your magic link...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-lavender/30 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Sign In Successful!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Welcome back to PMU Pro
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                You have successfully signed in as <strong>{userEmail}</strong>
              </AlertDescription>
            </Alert>

            <div className="text-center text-sm text-gray-600">
              <p>Redirecting you to the dashboard...</p>
            </div>

            <Link href="/dashboard">
              <Button className="w-full bg-lavender hover:bg-lavender-600">
                <ArrowRight className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-lavender/30 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Verification Failed
          </CardTitle>
          <CardDescription className="text-gray-600">
            We couldn't verify your magic link
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>

          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>This could happen if:</p>
            <ul className="text-left space-y-1">
              <li>• The link has expired (24 hours)</li>
              <li>• The link has already been used</li>
              <li>• The link is invalid or corrupted</li>
            </ul>
          </div>

          <div className="space-y-3 pt-4">
            <Button onClick={handleRetry} className="w-full bg-lavender hover:bg-lavender-600">
              <ArrowRight className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>

          <div className="text-center text-xs text-gray-500 pt-4">
            <p>Need help? Contact support at support@pmu-guide.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MagicLinkVerificationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-lavender/30 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-lavender/10 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-lavender animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Loading...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <MagicLinkVerificationContent />
    </Suspense>
  )
}
