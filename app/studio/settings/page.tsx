"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, Save, CheckCircle, AlertTriangle } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { NavBar } from '@/components/ui/navbar'

export default function StudioSettingsPage() {
  const { currentUser, isLoading } = useDemoAuth()
  const [studioName, setStudioName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setStudioName((currentUser as any).studioName || '')
      setBusinessName((currentUser as any).businessName || '')
    }
  }, [currentUser])

  const handleSave = async () => {
    if (!studioName || !businessName) {
      alert('Both Studio Name and Business Name are required')
      return
    }

    setIsSaving(true)
    setSaveSuccess(false)

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({
          studioName,
          businessName
        })
      })

      if (response.ok) {
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('demoUser') || '{}')
        userData.studioName = studioName
        userData.businessName = businessName
        localStorage.setItem('demoUser', JSON.stringify(userData))
        
        // Mark as complete to prevent redirect loop
        sessionStorage.setItem('onboarding-complete', 'true')
        localStorage.setItem('studio-setup-complete', 'true')
        
        setSaveSuccess(true)
        
        // Update team members
        const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]')
        teamMembers.forEach((m: any) => {
          m.studioName = studioName
          if (!m.businessName) m.businessName = businessName
        })
        localStorage.setItem('studio-team-members', JSON.stringify(teamMembers))
        
        alert(`✅ Studio settings saved!\n\nStudio Name: ${studioName}\nBusiness Name: ${businessName}\n\nAll team members have been updated.`)
        
        setTimeout(() => setSaveSuccess(false), 5000)
      } else {
        const errorData = await response.json()
        alert(`Failed to save: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const hasAccess = currentUser && ['owner', 'manager', 'director'].includes(currentUser.role)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          avatar: (currentUser as any).avatar
        } : undefined} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          avatar: (currentUser as any).avatar
        } : undefined} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="border-red-200">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
              <p className="text-gray-600">
                Only studio owners and managers can access studio settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
      <NavBar />
      
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-lavender" />
            Studio Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your studio name and business information
          </p>
        </div>

        {saveSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Settings saved successfully! All team members have been updated.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-lavender/20">
          <CardHeader>
            <CardTitle>Studio Information</CardTitle>
            <CardDescription>
              These names are shared with all team members and used throughout the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                <strong>Important:</strong> Changing these names will update all team members in your studio automatically.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="studioName" className="text-base font-semibold">
                  Studio Name *
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  This is your primary studio name (e.g., "Universal Beauty Studio Academy")
                </p>
                <Input
                  id="studioName"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  placeholder="Enter studio name"
                  className="border-lavender/30 focus:border-lavender"
                  required
                />
              </div>

              <div>
                <Label htmlFor="businessName" className="text-base font-semibold">
                  Business Name *
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  Your full business name (e.g., "Universal Beauty Studio - Tyrone Jackson")
                </p>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter business name"
                  className="border-lavender/30 focus:border-lavender"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={handleSave}
                disabled={isSaving || !studioName || !businessName}
                className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender-700 text-white px-8 py-6 text-lg"
              >
                {isSaving ? (
                  <>
                    <Save className="h-5 w-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Studio Settings
                  </>
                )}
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
              <p className="font-semibold mb-2">How this works:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Studio Name is used to group your team members</li>
                <li>Business Name appears on invoices and client communications</li>
                <li>All current and future team members inherit these names</li>
                <li>Changes save to the production database permanently</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

