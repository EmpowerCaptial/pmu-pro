"use client"

import { Button } from "@/components/ui/button"
import { Home, Check, Star } from "lucide-react"
import Link from "next/link"
import { BILLING_PLANS, getPriceId } from "@/lib/billing-config"

export default function BillingPage() {
  const handleCheckout = async (plan: 'starter' | 'professional' | 'studio') => {
    try {
      const priceId = getPriceId(plan)
      
      // Get user email from localStorage or prompt for it
      let customerEmail = 'demo@pmupro.com' // Default demo email
      
      // Try to get email from localStorage
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('demoUser')
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser)
            customerEmail = user.email || customerEmail
          } catch (error) {
            console.error('Error parsing saved user:', error)
          }
        }
        
        // If no email found, prompt user
        if (!customerEmail || customerEmail === 'demo@pmupro.com') {
          const email = prompt('Please enter your email address for billing:')
          if (email && email.includes('@')) {
            customerEmail = email
          } else {
            alert('Please enter a valid email address')
            return
          }
        }
      }
      
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: priceId,
          customerEmail: customerEmail,
          successUrl: `${window.location.origin}/billing/success`,
          cancelUrl: `${window.location.origin}/billing`,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }
      
      const { url } = await response.json()
      if (url) {
        // Use redirect page to handle HTTPS redirect properly
        window.location.href = `/checkout-redirect?url=${encodeURIComponent(url)}`
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert(`Failed to start checkout: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
        {/* Mobile Header */}
        <div className="md:hidden mb-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-8 h-8 object-contain" />
              <h1 className="text-2xl font-serif font-bold text-ink">Subscription Plans</h1>
            </div>
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-lavender/10 hover:border-lavender bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold w-full"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink">Subscription Plans</h1>
            </div>
          </div>
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-lavender/10 hover:border-lavender bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Choose the perfect plan for your PMU practice. All plans include our comprehensive analysis tools and client
            management system.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-lavender/20 hover:shadow-xl transition-all duration-300">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-ink mb-2">{BILLING_PLANS.starter.name}</h3>
              <div className="text-4xl font-bold text-lavender mb-2">${BILLING_PLANS.starter.price}</div>
              <div className="text-muted">per month</div>
              <p className="text-sm text-muted mt-2">{BILLING_PLANS.starter.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {BILLING_PLANS.starter.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-lavender mr-3" />
                  <span className="text-ink">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout('starter')}
              className="w-full bg-gradient-to-r from-lavender to-lavender-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </button>
          </div>

          {/* Professional Plan */}
          <div className="bg-gradient-to-br from-lavender/10 to-beige/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border-2 border-lavender/30 relative overflow-hidden">
            {/* Popular badge */}
            {BILLING_PLANS.professional.popular && (
              <div className="absolute top-4 right-4 bg-lavender text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <Star className="w-3 h-3" />
                Most Popular
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-ink mb-2">{BILLING_PLANS.professional.name}</h3>
              <div className="text-4xl font-bold text-lavender mb-2">${BILLING_PLANS.professional.price}</div>
              <div className="text-muted">per month</div>
              <p className="text-sm text-muted mt-2">{BILLING_PLANS.professional.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {BILLING_PLANS.professional.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-lavender mr-3" />
                  <span className="text-muted">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout('professional')}
              className="w-full bg-gradient-to-r from-lavender to-lavender-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </button>
          </div>

          {/* Studio Plan */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-lavender/20 hover:shadow-xl transition-all duration-300">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-ink mb-2">{BILLING_PLANS.studio.name}</h3>
              <div className="text-4xl font-bold text-lavender mb-2">${BILLING_PLANS.studio.price}</div>
              <div className="text-muted">per month</div>
              <p className="text-sm text-muted mt-2">{BILLING_PLANS.studio.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {BILLING_PLANS.studio.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-lavender mr-3" />
                  <span className="text-ink">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout('studio')}
              className="w-full bg-gradient-to-r from-lavender to-lavender-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Get Started
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
