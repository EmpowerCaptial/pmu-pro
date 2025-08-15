"use client"

import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Link from "next/link"

export default function BillingPage() {
  const handleBasicCheckout = async () => {
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: "price_basic_monthly", // Replace with actual Stripe price ID
          plan: "basic",
        }),
      })
      const { url } = await response.json()
      if (url) window.location.href = url
    } catch (error) {
      console.error("Checkout error:", error)
    }
  }

  const handlePremiumCheckout = async () => {
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: "price_premium_monthly", // Replace with actual Stripe price ID
          plan: "premium",
        }),
      })
      const { url } = await response.json()
      if (url) window.location.href = url
    } catch (error) {
      console.error("Checkout error:", error)
    }
  }

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

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink">Subscription Plans</h1>
            </div>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-lavender/10 hover:border-lavender bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Choose the perfect plan for your PMU practice. All plans include our comprehensive analysis tools and client
            management system.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-lavender/20 hover:shadow-xl transition-all duration-300">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-ink mb-2">PMU Tools</h3>
              <div className="text-4xl font-bold text-lavender mb-2">$22</div>
              <div className="text-muted">per month</div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-lavender rounded-full mr-3"></div>
                <span className="text-ink">AI Contraindication Screening</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-lavender rounded-full mr-3"></div>
                <span className="text-ink">Fitzpatrick Skin Analysis</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-lavender rounded-full mr-3"></div>
                <span className="text-ink">Pigment Matching Recommendations</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-lavender rounded-full mr-3"></div>
                <span className="text-ink">Client Management System</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-lavender rounded-full mr-3"></div>
                <span className="text-ink">Aftercare Instructions & Reminders</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-lavender rounded-full mr-3"></div>
                <span className="text-ink">Booking & Scheduling Tools</span>
              </li>
            </ul>

            <button
              onClick={handleBasicCheckout}
              className="w-full bg-gradient-to-r from-lavender to-lavender-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-lavender/10 to-beige/20 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-lavender/30 relative overflow-hidden">
            {/* Popular badge */}
            <div className="absolute top-4 right-4 bg-lavender text-white px-3 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-ink mb-2">PMU Tools + Local Listing</h3>
              <div className="text-4xl font-bold text-lavender mb-2">$35</div>
              <div className="text-muted">per month</div>
              <div className="text-sm text-lavender-600 mt-1">$22 Tools + $13 Local Listing</div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-lavender rounded-full mr-3"></div>
                <span className="text-ink font-semibold">Everything in PMU Tools, plus:</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-lavender rounded-full mr-3"></div>
                <span className="text-ink">Local Artist Directory Listing</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-lavender rounded-full mr-3"></div>
                <span className="text-ink">Client Referral System</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-lavender rounded-full mr-3"></div>
                <span className="text-ink">Enhanced Profile Visibility</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-lavender rounded-full mr-3"></div>
                <span className="text-ink">Priority Customer Support</span>
              </li>
              <li className="flex items-center text-amber-600">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                <span className="font-medium">Requires License Verification & Approval</span>
              </li>
            </ul>

            <button
              onClick={handlePremiumCheckout}
              className="w-full bg-gradient-to-r from-lavender to-lavender-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 max-w-3xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-lavender/20">
            <h4 className="text-lg font-semibold text-ink mb-3">Local Artist Listing Requirements</h4>
            <p className="text-muted text-sm leading-relaxed">
              To be featured in our local artist directory, you must provide valid PMU licensing documentation and
              complete our verification process. This ensures clients are connected only with qualified, licensed
              professionals. Approval typically takes 2-3 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
