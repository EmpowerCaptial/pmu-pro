"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function CheckoutRedirectPage() {
  const searchParams = useSearchParams()
  const [redirecting, setRedirecting] = useState(true)
  const checkoutUrl = searchParams.get('url')

  useEffect(() => {
    if (checkoutUrl) {
      // Add a small delay to show the redirect message
      setTimeout(() => {
        window.location.href = checkoutUrl
      }, 1000)
    } else {
      setRedirecting(false)
    }
  }, [checkoutUrl])

  if (!checkoutUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-beige/30 to-ivory flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ink mb-4">Invalid Checkout URL</h1>
          <p className="text-muted mb-6">The checkout URL is missing or invalid.</p>
          <a 
            href="/billing" 
            className="inline-flex items-center px-4 py-2 bg-lavender text-white rounded-lg hover:bg-lavender-600 transition-colors"
          >
            Back to Billing
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-beige/30 to-ivory flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-ink mb-4">Redirecting to Checkout</h1>
        <p className="text-muted">Please wait while we redirect you to Stripe...</p>
        <p className="text-sm text-muted mt-2">
          If you're not redirected automatically, 
          <a href={checkoutUrl} className="text-lavender hover:underline ml-1">
            click here
          </a>
        </p>
      </div>
    </div>
  )
}
