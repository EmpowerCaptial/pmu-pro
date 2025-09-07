'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Users, BarChart3, Headphones } from 'lucide-react'

export function PlanToggle() {
  const [plan, setPlan] = useState<'self' | 'optimized'>('self')

  const subscribe = async () => {
    try {
      const res = await fetch('/api/marketing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: 'price_selfserve_123' })
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch (error) {
      console.error('Subscription error:', error)
    }
  }

  const bookCall = () => {
    document.getElementById('lead')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="plans" className="container mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif font-bold mb-4">Choose Your Plan</h2>
        <p className="text-lg opacity-80 max-w-2xl mx-auto">
          Start with Self-Serve or get full optimization from our expert agents
        </p>
      </div>

      {/* Plan Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-2xl p-2 flex">
          <button
            onClick={() => setPlan('self')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              plan === 'self'
                ? 'bg-[#C6AA76] text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Self-Serve
          </button>
          <button
            onClick={() => setPlan('optimized')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              plan === 'optimized'
                ? 'bg-[#C6AA76] text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Optimized by Agents
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="max-w-4xl mx-auto">
        {plan === 'self' ? (
          <Card className="rounded-2xl border-2 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-serif">Self-Serve</CardTitle>
              <p className="text-lg opacity-80">You control budget & creative</p>
              <div className="text-3xl font-bold text-[#C6AA76] mt-4">
                From $97<span className="text-lg font-normal">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Meta & Google account connection</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>PMU campaign templates (brows, lips, eyeliner)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>AI inbox & instant booking links</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Basic reporting & analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Email support</span>
                </div>
              </div>
              
              <Button 
                onClick={subscribe}
                className="w-full bg-[#000] hover:bg-gray-800 text-white py-4 text-lg font-semibold rounded-xl"
              >
                Start Self-Serve
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border-2 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-serif">Optimized by ThePMUGuide Agents</CardTitle>
              <p className="text-lg opacity-80">Weekly tuning, creative tests, and strategy</p>
              <div className="text-3xl font-bold text-[#C6AA76] mt-4">
                From $497<span className="text-lg font-normal">/mo</span>
                <span className="text-sm font-normal block opacity-80">+ 10% of ad spend</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Everything in Self-Serve</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Campaign setup & quality assurance</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Weekly optimization & creative testing</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Monthly strategy report & roadmap</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Priority support & strategy calls</span>
                </div>
              </div>
              
              <Button 
                onClick={bookCall}
                className="w-full bg-[#C6AA76] hover:bg-[#B89A6B] text-white py-4 text-lg font-semibold rounded-xl"
              >
                Book Strategy Call
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Info */}
      <div className="text-center mt-8">
        <p className="text-sm opacity-70">
          Both plans include month-to-month billing • Cancel anytime • 30-day money-back guarantee
        </p>
      </div>
    </section>
  )
}
