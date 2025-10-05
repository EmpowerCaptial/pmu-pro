"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Loader2, UserPlus, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"

export default function CreateInstructorPage() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    businessName: '',
    licenseNumber: '',
    licenseState: 'CA',
    password: '',
    confirmPassword: '',
    role: 'artist',
    selectedPlan: 'studio'
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Handle invitation parameters
  useEffect(() => {
    const invitation = searchParams.get('invitation')
    const studio = searchParams.get('studio')
    
    if (invitation === 'instructor' && studio) {
      // Pre-fill form for instructor invitation
      setFormData(prev => ({
        ...prev,
        role: 'instructor',
        selectedPlan: 'studio',
        businessName: decodeURIComponent(studio)
      }))
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: '', text: '' })

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/create-instructor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: `Instructor created successfully! Email: ${data.email}` })
        // Reset form but preserve invitation context
        const invitation = searchParams.get('invitation')
        const studio = searchParams.get('studio')
        
        setFormData({
          email: '',
          name: '',
          businessName: invitation === 'instructor' && studio ? decodeURIComponent(studio) : '',
          licenseNumber: '',
          licenseState: 'CA',
          password: '',
          confirmPassword: '',
          role: invitation === 'instructor' ? 'instructor' : 'artist',
          selectedPlan: 'studio'
        })
      } else {
        setMessage({ type: 'error', text: data.details || 'Failed to create instructor' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-sm:max-w-md border-lavender/30 shadow-xl">
        <CardHeader className="text-center">
          {/* Mobile Back Button */}
          <div className="md:hidden mb-4">
            <Link href="/admin">
              <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5 bg-transparent w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </div>

          {/* Desktop Back Button */}
          <div className="hidden md:block mb-6">
            <Link href="/admin">
              <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5 bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </div>

          <div className="mx-auto w-16 h-16 bg-lavender/10 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-8 w-8 text-lavender" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {searchParams.get('invitation') === 'instructor' ? 'Join Studio as Instructor' : 'Create Instructor'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {searchParams.get('invitation') === 'instructor' 
              ? 'Complete your instructor profile to join the studio'
              : 'Add a new instructor to the platform'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {message.text && (
            <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
              {message.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="admin@universalbeautystudio.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Universal Beauty Studio Admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                type="text"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Universal Beauty Studio"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  placeholder="UBS001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseState">License State</Label>
                <Select value={formData.licenseState} onValueChange={(value) => handleInputChange('licenseState', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                    <SelectItem value="OH">Ohio</SelectItem>
                    <SelectItem value="WA">Washington</SelectItem>
                    <SelectItem value="OR">Oregon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="artist">Artist</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="selectedPlan">Plan</Label>
                <Select value={formData.selectedPlan} onValueChange={(value) => handleInputChange('selectedPlan', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-lavender hover:bg-lavender/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {searchParams.get('invitation') === 'instructor' ? 'Joining Studio...' : 'Creating Instructor...'}
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {searchParams.get('invitation') === 'instructor' ? 'Join Studio as Instructor' : 'Create Instructor'}
                </>
              )}
            </Button>
          </form>

          {searchParams.get('invitation') === 'instructor' ? (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900 mb-2">🎓 Instructor Invitation</h3>
              <p className="text-xs text-blue-700">
                You've been invited to join {decodeURIComponent(searchParams.get('studio') || 'the studio')} as an instructor. 
                Please complete your profile with your license information and create a secure password.
              </p>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Default Values</h3>
              <p className="text-xs text-gray-600">
                This form is pre-populated with default values for creating the Universal Beauty Studio admin account. 
                You can modify any field before submitting.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
