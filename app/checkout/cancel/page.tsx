"use client"

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  XCircle, 
  ArrowLeft, 
  Home,
  CreditCard,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'

export default function CheckoutCancelPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-5 to-orange-50">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        {/* Cancel Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
          <p className="text-xl text-gray-600">
            Your payment was not completed. No charges were made to your account.
          </p>
        </div>

        {/* Cancellation Details */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">What Happened?</CardTitle>
            <CardDescription>
              Your checkout session was cancelled before payment completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-sm font-bold">!</span>
                </div>
                <div>
                  <h4 className="font-semibold">No Charges Made</h4>
                  <p className="text-sm text-gray-600">
                    Your payment was not processed, so no money was withdrawn from your account.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-sm font-bold">!</span>
                </div>
                <div>
                  <h4 className="font-semibold">Service Not Confirmed</h4>
                  <p className="text-sm text-gray-600">
                    Your service appointment is not confirmed until payment is completed.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-sm font-bold">!</span>
                </div>
                <div>
                  <h4 className="font-semibold">Session ID</h4>
                  <p className="text-sm text-gray-600">
                    {sessionId ? (
                      <span className="font-mono bg-white px-2 py-1 rounded text-xs">
                        {sessionId}
                      </span>
                    ) : (
                      'No session ID available'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Reasons */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Why Might This Happen?</CardTitle>
            <CardDescription>
              Common reasons for payment cancellation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  You closed the payment window before completing the transaction
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  You navigated away from the payment page
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  There was a technical issue with the payment system
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  You decided not to proceed with the payment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-700">What Can You Do Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Try Again</h4>
                  <p className="text-sm text-gray-600">
                    You can return to the service checkout and try the payment again.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Contact Support</h4>
                  <p className="text-sm text-gray-600">
                    If you're experiencing issues, our support team can help you complete your payment.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Alternative Payment</h4>
                  <p className="text-sm text-gray-600">
                    We can arrange alternative payment methods if needed.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <Link href="/checkout">
            <Button className="bg-lavender hover:bg-lavender-600 text-white">
              <CreditCard className="h-4 w-4 mr-2" />
              Try Payment Again
            </Button>
          </Link>
        </div>

        {/* Support Information */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-3">
              <p className="text-gray-600">
                Having trouble with your payment? Our support team is here to help.
              </p>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:support@pmupro.com" className="text-lavender hover:underline">
                    support@pmupro.com
                  </a>
                </p>
                <p className="text-sm">
                  <strong>Phone:</strong>{' '}
                  <a href="tel:+1-555-123-4567" className="text-lavender hover:underline">
                    (555) 123-4567
                  </a>
                </p>
                <p className="text-sm">
                  <strong>Hours:</strong> Monday - Friday, 9 AM - 6 PM EST
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Return Home */}
        <div className="text-center mt-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-gray-500 hover:text-gray-700">
              <Home className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
