"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { ArtistApplicationService } from "@/lib/artist-application-service"
import { TrialService } from "@/lib/trial-service"
import { useDemoAuth } from "@/hooks/use-demo-auth"

export default function ArtistSignupPage() {
  const { currentUser, login } = useDemoAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: "",
    businessName: "",
    businessAddress: "",
    licenseNumber: "",
    licenseState: "",
    experience: "",
    specialties: [] as string[],
    portfolioUrl: "",
    socialMedia: [] as string[],
    agreeToTerms: false
  })

  const specialtyOptions = [
    "Microblading",
    "Powder Brows",
    "Lip Blushing",
    "Eyeliner",
    "Areola Restoration",
    "Scalp Micropigmentation",
    "Other"
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specialties: checked 
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors([])

    try {
      // Validate required fields
      const validationErrors: string[] = []
      
      if (!formData.name.trim()) validationErrors.push("Full name is required")
      if (!formData.email.trim()) validationErrors.push("Email is required")
      if (!formData.phone.trim()) validationErrors.push("Phone number is required")
      if (!formData.businessName.trim()) validationErrors.push("Business name is required")
      if (!formData.businessAddress.trim()) validationErrors.push("Business address is required")
      if (!formData.experience.trim()) validationErrors.push("Please describe your experience")
      if (!formData.agreeToTerms) validationErrors.push("You must agree to the terms and conditions")

      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        setIsSubmitting(false)
        return
      }

      // Submit application
      const application = ArtistApplicationService.submitApplication({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        licenseNumber: formData.licenseNumber || undefined,
        licenseState: formData.licenseState || undefined,
        experience: formData.experience,
        specialties: formData.specialties,
        portfolioUrl: formData.portfolioUrl || undefined,
        socialMedia: formData.socialMedia
      })

      // Start trial for the user
      TrialService.startTrial(formData.email)

      // Automatically log in the user with their application data
      // Create a temporary user object for the auth system
      const tempUser = {
        id: application.id,
        name: formData.name,
        email: formData.email,
        role: 'artist',
        isRealAccount: true,
        subscription: 'trial',
        features: ['all']
      }

      // Store user in localStorage for auth system
      localStorage.setItem('demoUser', JSON.stringify(tempUser))
      localStorage.setItem('userType', 'production')

      setIsSubmitted(true)
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 3000)

    } catch (error) {
      console.error('Application submission error:', error)
      setErrors(['Failed to submit application. Please try again.'])
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-beige/20 to-ivory flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to PMU Pro!</h2>
            <p className="text-gray-600 mb-4">
              Your application has been submitted and you've been automatically logged in. You now have immediate access to your 30-day free trial.
            </p>
            <Alert className="border-blue-200 bg-blue-50 mb-4">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                Your application is being reviewed in the background. You have full access to all features during this process.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-gray-500">
              Redirecting to dashboard in a few seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-beige/20 to-ivory">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Artist Application</h1>
          <p className="text-gray-600">
            Complete your application to access PMU Pro's full feature set
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
            <CardDescription>
              Please provide accurate information about your PMU practice. This helps us maintain quality standards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Errors */}
              {errors.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <ul className="text-red-800 text-sm space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="Your business name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessAddress">Business Address *</Label>
                    <Textarea
                      id="businessAddress"
                      value={formData.businessAddress}
                      onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                      placeholder="Full business address"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        placeholder="Your PMU license number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseState">License State</Label>
                      <Input
                        id="licenseState"
                        value={formData.licenseState}
                        onChange={(e) => handleInputChange('licenseState', e.target.value)}
                        placeholder="State where licensed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Experience & Specialties</h3>
                <div>
                  <Label htmlFor="experience">PMU Experience *</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="Describe your PMU experience, training, and background..."
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <Label>Specialties</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {specialtyOptions.map((specialty) => (
                      <div key={specialty} className="flex items-center space-x-2">
                        <Checkbox
                          id={specialty}
                          checked={formData.specialties.includes(specialty)}
                          onCheckedChange={(checked) => handleSpecialtyChange(specialty, checked as boolean)}
                        />
                        <Label htmlFor={specialty} className="text-sm">{specialty}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Portfolio */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Portfolio & Social Media</h3>
                <div>
                  <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                  <Input
                    id="portfolioUrl"
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                    placeholder="https://your-portfolio.com"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                    required
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm">
                    I agree to the Terms of Service and Privacy Policy *
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-lavender hover:bg-lavender-600 text-white py-3"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application & Start Trial'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}