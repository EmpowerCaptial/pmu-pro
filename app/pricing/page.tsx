"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Crown, Zap, Users, BarChart3, Settings, Shield } from "lucide-react"
import { TrialService, PRICING_PLANS, type TrialUser } from "@/lib/trial-service"
import { TrialBanner } from "@/components/trial/trial-banner"

export default function PricingPage() {
  const [trialUser, setTrialUser] = useState<TrialUser | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'studio' | null>(null)

  useEffect(() => {
    const user = TrialService.getTrialUser()
    setTrialUser(user)
  }, [])

  const handleUpgrade = (planId: 'starter' | 'professional' | 'studio') => {
    setSelectedPlan(planId)
    
    // Simulate upgrade process
    setTimeout(() => {
      TrialService.upgradeToPlan(planId)
      setTrialUser(TrialService.getTrialUser())
      setSelectedPlan(null)
      
      // Show success message
      alert(`Successfully upgraded to ${PRICING_PLANS.find(p => p.id === planId)?.name} plan!`)
    }, 1000)
  }

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('client')) return <Users className="h-4 w-4" />
    if (feature.includes('analytics') || feature.includes('reporting')) return <BarChart3 className="h-4 w-4" />
    if (feature.includes('support')) return <Shield className="h-4 w-4" />
    if (feature.includes('API') || feature.includes('integration')) return <Settings className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-beige/20 to-ivory">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Trial Banner */}
        <TrialBanner onUpgrade={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your PMU Pro Plan</h1>
          <p className="text-xl text-gray-600 mb-6">
            {trialUser?.isActive && !TrialService.isTrialExpired() 
              ? `Upgrade from your free trial to continue using PMU Pro`
              : 'Select the perfect plan for your PMU practice'
            }
          </p>
          
          {trialUser?.isActive && !TrialService.isTrialExpired() && (
            <div className="inline-flex items-center space-x-2 bg-lavender/10 px-4 py-2 rounded-full">
              <Zap className="h-4 w-4 text-lavender" />
              <span className="text-lavender font-medium">
                {TrialService.getTrialDaysRemaining()} days left in your trial
              </span>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {PRICING_PLANS.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-lavender border-2 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-lavender/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-lavender text-white px-4 py-1 text-sm">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-gray-900">${plan.price}</div>
                  <div className="text-gray-600">per month</div>
                </div>
                <CardDescription className="text-gray-600 mt-4">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="text-green-600 mt-0.5">
                        {getFeatureIcon(feature)}
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full py-3 text-lg ${
                    plan.popular 
                      ? 'bg-lavender hover:bg-lavender-600 text-white' 
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={selectedPlan === plan.id || trialUser?.plan === plan.id}
                >
                  {selectedPlan === plan.id ? (
                    'Processing...'
                  ) : trialUser?.plan === plan.id ? (
                    'Current Plan'
                  ) : (
                    'Upgrade Now'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Feature Comparison</CardTitle>
            <CardDescription className="text-center">
              See what's included in each plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Features</th>
                    <th className="text-center py-3 px-4 font-semibold">Starter</th>
                    <th className="text-center py-3 px-4 font-semibold">Professional</th>
                    <th className="text-center py-3 px-4 font-semibold">Studio</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b">
                    <td className="py-3 px-4">Client Management</td>
                    <td className="text-center py-3 px-4">Up to 50</td>
                    <td className="text-center py-3 px-4">Unlimited</td>
                    <td className="text-center py-3 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Document Management</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Portfolio Management</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Advanced Analytics</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Multi-Artist Support</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Priority Support</td>
                    <td className="text-center py-3 px-4">Email</td>
                    <td className="text-center py-3 px-4">Priority</td>
                    <td className="text-center py-3 px-4">Dedicated</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-600">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">What happens to my data if I cancel?</h4>
              <p className="text-gray-600">Your data is safely stored for 90 days after cancellation. You can reactivate your account anytime during this period.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Do you offer refunds?</h4>
              <p className="text-gray-600">We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Is there a setup fee?</h4>
              <p className="text-gray-600">No setup fees! You only pay the monthly subscription fee. No hidden costs.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


