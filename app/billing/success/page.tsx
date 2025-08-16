"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, Home, User } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    if (sessionId) {
      // In a real app, you'd verify the session with your backend
      // For now, we'll just simulate loading
      setTimeout(() => {
        setLoading(false)
        setSession({ id: sessionId })
      }, 2000)
    } else {
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender mx-auto mb-4"></div>
        <p className="text-muted">Processing your subscription...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-lavender/20 text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold text-ink mb-2">Welcome to PMU Pro!</h1>
          <p className="text-muted">Your subscription has been activated successfully.</p>
        </div>

        {sessionId && (
          <div className="bg-lavender/5 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted">
              Session ID: <span className="font-mono text-xs">{sessionId}</span>
            </p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-ink">
            You now have access to all PMU Pro features including AI contraindication analysis, 
            pigment matching, and client management tools.
          </p>
          
          <div className="pt-4 space-y-3">
            <Link href="/dashboard" className="block">
              <Button className="w-full bg-gradient-to-r from-lavender to-lavender-600 text-white hover:shadow-lg transition-all duration-300">
                <User className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            
            <Link href="/" className="block">
              <Button variant="outline" className="w-full hover:bg-lavender/10 hover:border-lavender">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-beige/30 to-ivory">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/images/pmu-guide-logo.png"
          alt="PMU Guide Logo"
          className="w-[60%] max-w-2xl h-auto opacity-10 object-contain"
        />
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-lavender/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-beige/20 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-lavender/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
        <Suspense fallback={
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender mx-auto mb-4"></div>
            <p className="text-muted">Loading...</p>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  )
}
