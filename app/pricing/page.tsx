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
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
        {/* Trial Banner */}
        <TrialBanner onUpgrade={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Choose Your PMU Pro Plan</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 px-4">
            {trialUser?.isActive && !TrialService.isTrialExpired() 
              ? `Upgrade from your free trial to continue using PMU Pro`
              : 'Select the perfect plan for your PMU practice'
            }
          </p>
          
          {trialUser?.isActive && !TrialService.isTrialExpired() && (
            <div className="inline-flex items-center space-x-2 bg-lavender/10 px-3 sm:px-4 py-2 rounded-full">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-lavender" />
              <span className="text-lavender font-medium text-sm sm:text-base">
                {TrialService.getTrialDaysRemaining()} days left in your trial
              </span>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
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
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-lavender text-white px-3 sm:px-4 py-1 text-xs sm:text-sm">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-3 sm:pb-4 p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900">${plan.price}</div>
                  <div className="text-sm sm:text-base text-gray-600">per month</div>
                </div>
                <CardDescription className="text-sm sm:text-base text-gray-600 mt-3 sm:mt-4">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <ul className="space-y-2 sm:space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                      <div className="text-green-600 mt-0.5">
                        {getFeatureIcon(feature)}
                      </div>
                      <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full py-2 sm:py-3 text-sm sm:text-base lg:text-lg ${
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
        <Card className="mb-8 sm:mb-12">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl text-center">Feature Comparison</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              See what's included in each plan
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">Features</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">Starter</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">Professional</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-sm sm:text-base">Studio</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Client Management</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Up to 50</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Unlimited</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Document Management</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">✓</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">✓</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Portfolio Management</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">✓</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">✓</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Advanced Analytics</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">-</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">✓</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Multi-Artist Support</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">-</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">-</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Priority Support</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Email</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Priority</td>
                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base">Dedicated</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div>
              <h4 className="font-semibold text-base sm:text-lg mb-2">Can I change plans anytime?</h4>
              <p className="text-sm sm:text-base text-gray-600">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h4 className="font-semibold text-base sm:text-lg mb-2">What happens to my data if I cancel?</h4>
              <p className="text-sm sm:text-base text-gray-600">Your data is safely stored for 90 days after cancellation. You can reactivate your account anytime during this period.</p>
            </div>
            <div>
              <h4 className="font-semibold text-base sm:text-lg mb-2">Do you offer refunds?</h4>
              <p className="text-sm sm:text-base text-gray-600">We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.</p>
            </div>
            <div>
              <h4 className="font-semibold text-base sm:text-lg mb-2">Is there a setup fee?</h4>
              <p className="text-sm sm:text-base text-gray-600">No setup fees! You only pay the monthly subscription fee. No hidden costs.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


