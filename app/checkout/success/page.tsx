"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Receipt, 
  Calendar, 
  User, 
  CreditCard, 
  Home,
  Download,
  Mail,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { getCheckoutSessionById, updateCheckoutSessionStatus } from '@/lib/checkout'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [checkoutSession, setCheckoutSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      // In a real app, you would verify the payment with Stripe here
      // For now, we'll just mark the session as completed
      const session = getCheckoutSessionById(sessionId)
      if (session && session.status === 'pending') {
        updateCheckoutSessionStatus(sessionId, 'completed')
        setCheckoutSession(session)
      } else if (session) {
        setCheckoutSession(session)
      }
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    )
  }

  if (!checkoutSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find your payment information.</p>
          <Link href="/dashboard">
            <Button className="bg-lavender hover:bg-lavender-600 text-white">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-beige/10">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-600">
            Thank you for your payment. Your service has been confirmed.
          </p>
        </div>

        {/* Payment Confirmation Card */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment Confirmation
            </CardTitle>
            <CardDescription>
              Your payment has been processed successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Service Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{checkoutSession.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Artist:</span>
                    <span className="font-medium">{checkoutSession.artistName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(checkoutSession.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Price:</span>
                    <span className="font-medium">
                      ${(checkoutSession.customPrice || checkoutSession.basePrice).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">${checkoutSession.taxAmount.toFixed(2)}</span>
                  </div>
                  {checkoutSession.gratuityAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gratuity:</span>
                      <span className="font-medium">${checkoutSession.gratuityAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total Paid:</span>
                    <span className="text-green-600">${checkoutSession.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Contact Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{checkoutSession.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{checkoutSession.clientEmail}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Service Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session ID:</span>
                    <span className="font-mono text-xs">{checkoutSession.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-700">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Confirmation Email</h4>
                  <p className="text-sm text-gray-600">
                    You'll receive a confirmation email with all the details of your service.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Artist Contact</h4>
                  <p className="text-sm text-gray-600">
                    Your artist will contact you within 24 hours to schedule your appointment.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Service Preparation</h4>
                  <p className="text-sm text-gray-600">
                    Review any preparation requirements sent by your artist before your appointment.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            className="border-lavender text-lavender hover:bg-lavender/5"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
          
          <Button 
            variant="outline"
            className="border-lavender text-lavender hover:bg-lavender/5"
            onClick={() => {
              const subject = encodeURIComponent(`Payment Confirmation - ${checkoutSession.serviceName}`)
              const body = encodeURIComponent(
                `Hi ${checkoutSession.clientName},\n\nThank you for your payment of $${checkoutSession.totalAmount.toFixed(2)} for ${checkoutSession.serviceName}.\n\nYour artist ${checkoutSession.artistName} will contact you soon to schedule your appointment.\n\nBest regards,\nPMU Pro Team`
              )
              window.open(`mailto:?subject=${subject}&body=${body}`)
            }}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Receipt
          </Button>
          
          <Link href="/dashboard">
            <Button className="bg-lavender hover:bg-lavender-600 text-white">
              <Home className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
          </Link>
        </div>

        {/* Support Information */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:support@pmupro.com" className="text-lavender hover:underline">
              support@pmupro.com
            </a>
          </p>
          <p className="mt-1">
            Payment processed securely by Stripe
          </p>
        </div>
      </div>
    </div>
  )
}
