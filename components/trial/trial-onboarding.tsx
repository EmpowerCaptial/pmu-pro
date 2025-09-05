"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertTriangle, Shield, Zap, Users, Award } from "lucide-react"
import { ArtistApplicationService } from "@/lib/artist-application-service"

interface TrialOnboardingProps {
  userEmail: string
  isOpen: boolean
  onClose: () => void
}

export function TrialOnboarding({ userEmail, isOpen, onClose }: TrialOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [application, setApplication] = useState<any>(null)

  useEffect(() => {
    if (isOpen && userEmail) {
      const app = ArtistApplicationService.getApplication(userEmail)
      setApplication(app)
    }
  }, [isOpen, userEmail])

  const steps = [
    {
      title: "🎉 Welcome to Your Free Trial!",
      content: (
        <div className="space-y-6">
          <div className="text-center bg-gradient-to-r from-green-50 to-lavender/10 rounded-xl p-6 border border-green-200/50">
            <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-lavender/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Trial Access Granted</h3>
            <p className="text-gray-700 font-medium">
              You now have <strong className="text-lavender-700">30 days</strong> of full access to PMU Pro's complete feature set!
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-lavender/10 border border-green-200/50 rounded-xl p-6 shadow-sm">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              What You Can Do Right Now:
            </h4>
            <ul className="text-sm text-green-700 space-y-2">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Upload and manage client documents
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Create consent forms and get digital signatures
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Build your professional portfolio
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Access the pigment library and analysis tools
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Use all PMU Pro features without restrictions
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "📋 Application Review Process",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6 bg-gradient-to-r from-blue-50 to-lavender/10 rounded-xl p-6 border border-blue-200/50">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-lavender/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assurance Process</h3>
            <p className="text-gray-700 font-medium">
              Your application is being reviewed to ensure PMU Pro maintains the highest standards.
            </p>
          </div>

          <div className="space-y-4">
            <Card className="border-blue-200/50 bg-gradient-to-r from-blue-50 to-lavender/10 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800">Review Timeline</h4>
                    <p className="text-sm text-blue-700">24-48 hours for initial review</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200/50 bg-gradient-to-r from-green-50 to-lavender/10 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800">Full Access During Review</h4>
                    <p className="text-sm text-green-700">Continue using all features while we review</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200/50 bg-gradient-to-r from-orange-50 to-lavender/10 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-800">If Additional Info Needed</h4>
                    <p className="text-sm text-orange-700">7-day grace period to provide requested information</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "🚀 What Happens Next?",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6 bg-gradient-to-r from-lavender/10 to-beige/20 rounded-xl p-6 border border-lavender/20">
            <div className="w-16 h-16 bg-gradient-to-r from-lavender/20 to-beige/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Zap className="h-8 w-8 text-lavender" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Journey with PMU Pro</h3>
            <p className="text-gray-700 font-medium">
              Here's what to expect as you grow with our platform
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4 bg-white/80 rounded-xl p-6 border border-lavender/10 shadow-sm">
              <div className="w-10 h-10 bg-lavender rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">1</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Explore & Learn</h4>
                <p className="text-sm text-gray-600">Use your 30-day trial to explore all features and see the value</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white/80 rounded-xl p-6 border border-lavender/10 shadow-sm">
              <div className="w-10 h-10 bg-lavender rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">2</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Application Review</h4>
                <p className="text-sm text-gray-600">Our team reviews your credentials and experience</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white/80 rounded-xl p-6 border border-lavender/10 shadow-sm">
              <div className="w-10 h-10 bg-lavender rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">3</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Choose Your Plan</h4>
                <p className="text-sm text-gray-600">Select the plan that fits your practice size and needs</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white/80 rounded-xl p-6 border border-lavender/10 shadow-sm">
              <div className="w-10 h-10 bg-lavender rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">4</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Grow Your Business</h4>
                <p className="text-sm text-gray-600">Use PMU Pro to streamline your practice and serve more clients</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-lavender/10 to-beige/20 border border-lavender/20 rounded-xl p-6 shadow-sm">
            <h4 className="font-semibold text-lavender-800 mb-2 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              💡 Pro Tip
            </h4>
            <p className="text-sm text-lavender-700">
              The more you use PMU Pro during your trial, the better you'll understand its value. 
              Try uploading client documents, creating consent forms, and building your portfolio!
            </p>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Mark onboarding as completed
    localStorage.setItem(`trial_onboarding_completed_${userEmail}`, 'true')
    onClose()
  }

  const handleSkip = () => {
    handleComplete()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-lavender/5 to-beige/10 border-lavender/20 shadow-2xl">
        <DialogHeader className="bg-lavender/10 border-b border-lavender/20 p-6 -m-6 mb-6">
          <DialogTitle className="text-2xl font-bold text-center text-lavender-800">
            {steps[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-center text-lavender-600 font-medium">
            Step {currentStep + 1} of {steps.length}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 bg-white/80 rounded-lg p-6 border border-lavender/10">
          {steps[currentStep].content}
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-white/60 rounded-lg p-4 border border-lavender/10">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-3 flex-1 rounded-full transition-all duration-300 ${
                  index <= currentStep ? 'bg-lavender shadow-lg' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-lavender-600 mt-2 font-medium">
            {currentStep + 1} of {steps.length} completed
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between bg-white/60 rounded-lg p-4 border border-lavender/10">
          <div>
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                className="border-lavender/30 text-lavender-700 hover:bg-lavender/10 hover:border-lavender/50"
              >
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="text-lavender-600 hover:text-lavender-700 hover:bg-lavender/10"
            >
              Skip Tour
            </Button>
            <Button 
              onClick={handleNext} 
              className="bg-lavender hover:bg-lavender-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
