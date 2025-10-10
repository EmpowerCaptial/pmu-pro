"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, ArrowRight, Building2 } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'

export default function StudioOnboardingPage() {
  const router = useRouter()
  const { currentUser } = useDemoAuth()
  const [step, setStep] = useState(1)
  const [studioName, setStudioName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveNames = async () => {
    if (!studioName || !businessName) {
      alert('Both fields are required')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ studioName, businessName })
      })

      if (response.ok) {
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('demoUser') || '{}')
        userData.studioName = studioName
        userData.businessName = businessName
        localStorage.setItem('demoUser', JSON.stringify(userData))
        
        setStep(2)
      } else {
        alert('Failed to save names')
      }
    } catch (error) {
      alert('Error saving names')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="bg-gradient-to-r from-lavender to-indigo-600 text-white">
          <CardTitle className="text-2xl">Welcome to Studio Enterprise!</CardTitle>
          <p className="text-white/90 text-sm mt-2">Let's set up your studio in 2 quick steps</p>
        </CardHeader>
        <CardContent className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-lavender text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-lg">Studio Information</h3>
                  <p className="text-sm text-gray-600">This will be shared with all your team members</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="studioName" className="text-base font-semibold">
                    Studio Name *
                  </Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Your primary studio name (e.g., "Beauty Studio Academy")
                  </p>
                  <Input
                    id="studioName"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    placeholder="Enter your studio name"
                    className="border-lavender/30 focus:border-lavender text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="businessName" className="text-base font-semibold">
                    Business Name *
                  </Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Full business name for invoices (e.g., "Beauty Studio - Jane Smith")
                  </p>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter your business name"
                    className="border-lavender/30 focus:border-lavender text-lg"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveNames}
                disabled={!studioName || !businessName || isSaving}
                className="w-full bg-gradient-to-r from-lavender to-indigo-600 text-white py-6 text-lg"
              >
                {isSaving ? 'Saving...' : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center">
              <CheckCircle className="h-20 w-20 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">All Set!</h2>
              <p className="text-gray-600">
                Your studio is configured. Here's what to do next:
              </p>

              <div className="bg-lavender/10 rounded-lg p-6 text-left space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-lavender text-white font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Add Your Services</p>
                    <p className="text-sm text-gray-600">Go to Services page and add the treatments you offer</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-lavender text-white font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Add Team Members</p>
                    <p className="text-sm text-gray-600">Studio → Team Management - Add students, instructors, licensed artists</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-lavender text-white font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Assign Services</p>
                    <p className="text-sm text-gray-600">Studio → Service Assignments - Control which services each member can perform</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button
                  onClick={() => router.push('/services')}
                  variant="outline"
                  className="border-lavender text-lavender hover:bg-lavender/10"
                >
                  Add Services
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-lavender to-indigo-600"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

