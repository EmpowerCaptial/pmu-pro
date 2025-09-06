"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Crown, Users, CheckCircle, AlertTriangle, Zap } from "lucide-react"
import { TrialService, PRICING_PLANS, type TrialUser } from "@/lib/trial-service"

interface TrialDashboardProps {
  onUpgrade?: (planId: 'starter' | 'professional' | 'studio') => void
}

export function TrialDashboard({ onUpgrade }: TrialDashboardProps) {
  const [trialUser, setTrialUser] = useState<TrialUser | null>(null)
  const [daysRemaining, setDaysRemaining] = useState(0)
  const [trialProgress, setTrialProgress] = useState({ daysUsed: 0, daysTotal: 30, percentage: 0 })

  useEffect(() => {
    const loadTrialData = () => {
      const user = TrialService.getTrialUser()
      const remaining = TrialService.getTrialDaysRemaining()
      const progress = TrialService.getTrialProgress()
      
      setTrialUser(user)
      setDaysRemaining(remaining)
      setTrialProgress(progress)
    }

    loadTrialData()
    
    // Update every minute
    const interval = setInterval(loadTrialData, 60000)
    return () => clearInterval(interval)
  }, [])

  if (!trialUser) return null

  const isExpired = TrialService.isTrialExpired()
  const isActive = trialUser.isActive && !isExpired

  const handleUpgrade = (planId: 'starter' | 'professional' | 'studio') => {
    TrialService.upgradeToPlan(planId)
    setTrialUser(TrialService.getTrialUser())
    onUpgrade?.(planId)
  }

  return (
    <div className="space-y-6">
      {/* Trial Status Card */}
      <Card className={`border-2 ${isExpired ? 'border-red-200 bg-red-50' : 'border-lavender/30 bg-lavender/5'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${isExpired ? 'bg-red-100' : 'bg-lavender/20'}`}>
                <Clock className={`h-5 w-5 ${isExpired ? 'text-red-600' : 'text-lavender'}`} />
              </div>
              <div>
                <CardTitle className={isExpired ? 'text-red-800' : 'text-lavender-700'}>
                  {isExpired ? 'Trial Expired' : 'Free Trial Active'}
                </CardTitle>
                <CardDescription>
                  {isExpired 
                    ? 'Your trial has ended. Upgrade to continue using PMU Pro.'
                    : `${daysRemaining} days remaining in your free trial`
                  }
                </CardDescription>
              </div>
            </div>
            {isActive && (
              <Badge variant="secondary" className="bg-lavender/20 text-lavender">
                <Zap className="h-3 w-3 mr-1" />
                Trial Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isActive && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Trial Progress</span>
                  <span>{trialProgress.daysUsed} of {trialProgress.daysTotal} days</span>
                </div>
                <Progress value={trialProgress.percentage} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-lavender" />
                  <span>{trialUser.clientCount} clients added</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Full access to all features</span>
                </div>
              </div>
            </div>
          )}

          {isExpired && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Your trial has expired. Upgrade now to keep your data and continue using PMU Pro.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h3>
          <p className="text-gray-600">Upgrade to continue using PMU Pro with unlimited access</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PRICING_PLANS.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-lavender border-2 shadow-lg' : 'border-gray-200'}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-lavender text-white px-3 py-1">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-900">${plan.price}</div>
                  <div className="text-sm text-gray-600">per month</div>
                </div>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.popular ? 'bg-lavender hover:bg-lavender-600' : 'bg-gray-900 hover:bg-gray-800'}`}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {trialUser.plan === plan.id ? 'Current Plan' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Trial Benefits */}
      <Card className="bg-gradient-to-r from-lavender/10 to-beige/20">
        <CardContent className="p-6">
          <h4 className="font-semibold text-lg mb-4">What You Get During Trial</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Unlimited client management</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Document upload & signatures</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Portfolio management</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Consent form automation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Email notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Analytics & reporting</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


