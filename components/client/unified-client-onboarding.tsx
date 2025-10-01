"use client"

import { useState, useEffect } from 'react'
import { getServices } from '@/lib/services-api'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Phone, 
  Mail, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  Save,
  Download,
  Send,
  ArrowRight,
  ArrowLeft,
  Shield,
  Heart,
  Eye,
  Palette,
  Clock
} from 'lucide-react'
import { useSaveToClient } from '@/hooks/use-save-to-client'
import { ToolResult } from '@/components/client/save-to-client-prompt'
import { addClient, getClients } from '@/lib/client-storage'
import { useRouter } from 'next/navigation'

interface ClientOnboardingData {
  // Basic Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  emergencyContact: string
  emergencyPhone: string
  
  // Medical History
  medicalConditions: string[]
  medications: string[]
  allergies: string[]
  skinConditions: string[]
  previousPMU: boolean
  previousPMUDetails: string
  
  // PMU Preferences
  desiredService: string
  desiredColor: string
  previousExperience: string
  expectations: string
  
  // Lifestyle & Habits
  sunExposure: string
  skincareRoutine: string
  exerciseHabits: string
  smokingStatus: string
  
  // Consent & Legal
  photoConsent: boolean
  medicalRelease: boolean
  liabilityWaiver: boolean
  aftercareAgreement: boolean
  
  // Additional Notes
  notes: string
  concerns: string
}

const MEDICAL_CONDITIONS = [
  'Diabetes', 'Hypertension', 'Heart Disease', 'Autoimmune Disorders',
  'Cancer', 'Blood Disorders', 'Liver Disease', 'Kidney Disease',
  'Thyroid Issues', 'Skin Cancer', 'Psoriasis', 'Eczema',
  'Acne', 'Rosacea', 'None'
]

const ALLERGIES = [
  'Latex', 'Nickel', 'Dyes', 'Antibiotics', 'Anesthetics',
  'Topical Creams', 'Adhesives', 'None'
]

const SKIN_CONDITIONS = [
  'Sensitive Skin', 'Oily Skin', 'Dry Skin', 'Combination Skin',
  'Acne-Prone', 'Scarring', 'Hyperpigmentation', 'None'
]

// PMU services will be loaded from API

const SUN_EXPOSURE_OPTIONS = [
  'Minimal (Indoor mostly)', 'Moderate (Some outdoor activities)',
  'High (Outdoor work/sports)', 'Very High (Beach/sunbathing)'
]

export default function UnifiedClientOnboarding() {
  const router = useRouter()
  const { currentUser, isAuthenticated } = useDemoAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [availableServices, setAvailableServices] = useState<string[]>([])
  const [formData, setFormData] = useState<ClientOnboardingData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: [],
    medications: [],
            allergies: [],
        skinConditions: [],
        previousPMU: false,
        previousPMUDetails: '',
        desiredService: '',
        desiredColor: '',
        previousExperience: '',
        expectations: '',
        sunExposure: '',
        skincareRoutine: '',
        exerciseHabits: '',
        smokingStatus: '',
        photoConsent: false,
        medicalRelease: false,
        liabilityWaiver: false,
        aftercareAgreement: false,
        notes: '',
        concerns: ''
  })

  // Load services from API
  useEffect(() => {
    if (isAuthenticated && currentUser?.email) {
      loadServices()
    }
  }, [isAuthenticated, currentUser])

  const loadServices = async () => {
    if (!currentUser?.email) return
    
    try {
      const userServices = await getServices(currentUser.email)
      const activeServices = userServices.filter(service => service.isActive)
      setAvailableServices(activeServices.map(service => service.name))
    } catch (error) {
      console.error('Error loading services:', error)
      // Fallback to default services
      setAvailableServices(['Microblading', 'Powder Brows', 'Lip Liner', 'Eyeliner', 'Lash Enhancement', 'Beauty Mark', 'Scar Camouflage', 'Areola Restoration'])
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const { promptToSave } = useSaveToClient()

  const totalSteps = 5

  const handleInputChange = (field: keyof ClientOnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: keyof ClientOnboardingData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Generate comprehensive client profile
      const clientProfile: ToolResult = {
        type: 'intake' as const,
        data: {
          ...formData,
          summary: generateClientSummary(formData),
          recommendations: generateRecommendations(formData),
          contraindications: checkContraindications(formData),
          riskLevel: assessRiskLevel(formData)
        },
        timestamp: new Date().toISOString(),
        toolName: 'Unified Client Onboarding'
      }

      // Prompt to save to client file
      promptToSave(clientProfile)
      
      setIsComplete(true)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateClientSummary = (data: ClientOnboardingData) => {
    return {
      name: `${data.firstName} ${data.lastName}`,
      contact: `${data.email} | ${data.phone}`,
      service: data.desiredService,
      riskFactors: checkContraindications(data).length,
      medicalHistory: data.medicalConditions.length > 0,
      previousPMU: data.previousPMU
    }
  }

  const generateRecommendations = (data: ClientOnboardingData) => {
    const recommendations = []
    
    if (data.medicalConditions.length > 0) {
      recommendations.push('Medical clearance recommended before procedure')
    }
    
    if (data.allergies.length > 0) {
      recommendations.push('Patch test required for allergy assessment')
    }
    
    if (data.previousPMU) {
      recommendations.push('Previous PMU work may affect results')
    }
    
    if (data.sunExposure.includes('High') || data.sunExposure.includes('Very High')) {
      recommendations.push('Sun protection and aftercare crucial')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Client appears suitable for PMU procedure')
    }
    
    return recommendations
  }

  const checkContraindications = (data: ClientOnboardingData) => {
    const contraindications = []
    
    if (data.medicalConditions.includes('Diabetes')) {
      contraindications.push('Diabetes may affect healing and results')
    }
    
    if (data.medicalConditions.includes('Autoimmune Disorders')) {
      contraindications.push('Autoimmune conditions may cause complications')
    }
    
    if (data.medicalConditions.includes('Skin Cancer')) {
      contraindications.push('History of skin cancer requires medical clearance')
    }
    
    if (data.smokingStatus === 'Yes') {
      contraindications.push('Smoking may affect healing and pigment retention')
    }
    
    return contraindications
  }

  const assessRiskLevel = (data: ClientOnboardingData) => {
    let riskScore = 0
    const riskFactors = []
    
    // Medical conditions (higher weight - more serious)
    if (data.medicalConditions.length > 0) {
      riskScore += data.medicalConditions.length * 2
      riskFactors.push(`${data.medicalConditions.length} medical condition(s)`)
    }
    
    // Allergies (medium weight)
    if (data.allergies.length > 0) {
      riskScore += data.allergies.length
      riskFactors.push(`${data.allergies.length} allergy/allergy(s)`)
    }
    
    // Previous PMU (low weight - not necessarily risky)
    if (data.previousPMU) {
      riskScore += 1
      riskFactors.push('Previous PMU work')
    }
    
    // Smoking (medium weight)
    if (data.smokingStatus === 'Yes') {
      riskScore += 2
      riskFactors.push('Smoking')
    }
    
    // Determine risk level with more nuanced logic
    if (riskScore === 0) {
      return { level: 'Low Risk', factors: ['No risk factors identified'], score: riskScore }
    } else if (riskScore <= 2) {
      return { level: 'Moderate Risk', factors: riskFactors, score: riskScore }
    } else if (riskScore <= 4) {
      return { level: 'Elevated Risk', factors: riskFactors, score: riskScore }
    } else {
      return { level: 'High Risk', factors: riskFactors, score: riskScore }
    }
  }

  const downloadForm = () => {
    const formContent = generateFormContent()
    const blob = new Blob([formContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `client-onboarding-${formData.firstName}-${formData.lastName}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateFormContent = () => {
    return `
PMU PRO - UNIFIED CLIENT ONBOARDING FORM
==========================================

CLIENT INFORMATION
------------------
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}
Date of Birth: ${formData.dateOfBirth}
Emergency Contact: ${formData.emergencyContact} (${formData.emergencyPhone})

MEDICAL HISTORY
---------------
Medical Conditions: ${formData.medicalConditions.join(', ') || 'None'}
Medications: ${formData.medications.join(', ') || 'None'}
Allergies: ${formData.allergies.join(', ') || 'None'}
Skin Conditions: ${formData.skinConditions.join(', ') || 'None'}
Previous PMU: ${formData.previousPMU ? 'Yes' : 'No'}
${formData.previousPMU ? `Previous PMU Details: ${formData.previousPMUDetails}` : ''}

PMU PREFERENCES
---------------
Desired Service: ${formData.desiredService}
Desired Color: ${formData.desiredColor}
Previous Experience: ${formData.previousExperience}
Expectations: ${formData.expectations}

LIFESTYLE & HABITS
-------------------
Sun Exposure: ${formData.sunExposure}
Skincare Routine: ${formData.skincareRoutine}
Exercise Habits: ${formData.exerciseHabits}
Smoking Status: ${formData.smokingStatus}

CONSENT & AGREEMENTS
---------------------
Photo Consent: ${formData.photoConsent ? 'Yes' : 'No'}
Medical Release: ${formData.medicalRelease ? 'Yes' : 'No'}
Liability Waiver: ${formData.liabilityWaiver ? 'Yes' : 'No'}
Aftercare Agreement: ${formData.aftercareAgreement ? 'Yes' : 'No'}

ADDITIONAL NOTES
----------------
Notes: ${formData.notes}
Concerns: ${formData.concerns}

ASSESSMENT SUMMARY
------------------
Risk Level: ${assessRiskLevel(formData).level}
Contraindications: ${checkContraindications(formData).join(', ') || 'None'}
Recommendations: ${generateRecommendations(formData).join(', ')}

Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
    `.trim()
  }

  const createClient = async () => {
    try {
      console.log('Creating client with data:', formData)
      
      const newClient = await addClient({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        notes: `Client Onboarding Summary: ${formData.firstName} ${formData.lastName} - ${formData.desiredService} - Risk: ${assessRiskLevel(formData).level}`,
        totalAnalyses: 0,
        lastResult: assessRiskLevel(formData).level === 'High Risk' ? 'not_recommended' : 
                   assessRiskLevel(formData).level === 'Moderate Risk' ? 'precaution' : 'safe',
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        dateOfBirth: formData.dateOfBirth,
        medicalConditions: formData.medicalConditions,
        allergies: formData.allergies,
        skinConditions: formData.skinConditions,
        previousPMU: formData.previousPMU,
        previousPMUDetails: formData.previousPMUDetails,
        desiredService: formData.desiredService,
        desiredColor: formData.desiredColor,
        sunExposure: formData.sunExposure,
        skincareRoutine: formData.skincareRoutine,
        exerciseHabits: formData.exerciseHabits,
        smokingStatus: formData.smokingStatus,
        medications: formData.medications,
        photoConsent: formData.photoConsent,
        medicalRelease: formData.medicalRelease,
        liabilityWaiver: formData.liabilityWaiver,
        aftercareAgreement: formData.aftercareAgreement
      }, currentUser?.email)
      
      console.log('Client created successfully:', newClient)
      
      // Verify the client was saved
      const allClients = await getClients(currentUser?.email)
      console.log('All clients after creation:', allClients)
      
      return newClient
    } catch (error) {
      console.error('Error creating client:', error)
      return null
    }
  }

  if (isComplete) {
    return (
      <Card className="max-w-4xl mx-auto border-lavender/20 bg-white">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Client Onboarding Complete!
          </h2>
          <p className="text-gray-600 mb-6">
            {formData.firstName} {formData.lastName} has been successfully onboarded and added to your client database.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-lavender/5 rounded-lg border border-lavender/20">
              <h4 className="font-medium text-lavender-700 mb-2">Risk Assessment</h4>
              <Badge className={assessRiskLevel(formData).level === 'High Risk' ? 'bg-red-100 text-red-800' : 
                               assessRiskLevel(formData).level === 'Moderate Risk' ? 'bg-yellow-100 text-yellow-800' : 
                               'bg-green-100 text-green-800'}>
                {assessRiskLevel(formData).level}
              </Badge>
            </div>
            
            <div className="p-4 bg-lavender/5 rounded-lg border border-lavender/20">
              <h4 className="font-medium text-lavender-700 mb-2">Service</h4>
              <p className="text-sm text-gray-600">{formData.desiredService}</p>
            </div>
            
            <div className="p-4 bg-lavender/5 rounded-lg border border-lavender/20">
              <h4 className="font-medium text-lavender-700 mb-2">Medical History</h4>
              <p className="text-sm text-gray-600">
                {formData.medicalConditions.length > 0 ? `${formData.medicalConditions.length} conditions` : 'None'}
              </p>
            </div>
          </div>

          {/* Risk Explanation Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-3">Risk Assessment Details</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Risk Score:</span>
                <span className="font-medium">{assessRiskLevel(formData).score}/10</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-600">Risk Factors:</span>
                <div className="text-right">
                  {assessRiskLevel(formData).factors.length > 0 ? (
                    assessRiskLevel(formData).factors.map((factor, index) => (
                      <div key={index} className="text-sm text-gray-700">• {factor}</div>
                    ))
                  ) : (
                    <span className="text-sm text-green-600">None identified</span>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <strong>Note:</strong> This assessment helps identify clients who may need additional medical clearance or special precautions. 
                  Always consult with healthcare professionals when in doubt.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={async () => {
                const newClient = await createClient()
                if (newClient) {
                  alert(`Client ${newClient.name} created successfully! You can now view them in your client database.`)
                  router.push('/clients')
                } else {
                  alert('Error creating client. Please try again.')
                }
              }} 
              className="bg-lavender hover:bg-lavender-600 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save to Client Database
            </Button>
            <Button onClick={downloadForm} variant="outline" className="border-lavender text-lavender">
              <Download className="h-4 w-4 mr-2" />
              Download Form
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                <CheckCircle className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button 
              onClick={() => {
                setFormData({
                  firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '',
                  emergencyContact: '', emergencyPhone: '', medicalConditions: [], medications: [],
                  allergies: [], skinConditions: [], previousPMU: false, previousPMUDetails: '',
                  desiredService: '', desiredColor: '', previousExperience: '', expectations: '',
                  sunExposure: '', skincareRoutine: '', exerciseHabits: '', smokingStatus: '',
                  photoConsent: false, medicalRelease: false, liabilityWaiver: false,
                  aftercareAgreement: false, notes: '', concerns: ''
                })
                setCurrentStep(1)
                setIsComplete(false)
              }} 
              variant="ghost" 
              className="text-lavender hover:bg-lavender/5"
            >
              <User className="h-4 w-4 mr-2" />
              Start New Client Onboarding
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-lavender/20 bg-white">
        <CardHeader className="text-center">
          {/* Mobile Layout */}
          <div className="md:hidden mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-lavender hover:bg-lavender/5 w-full mb-3">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            </Link>
            <CardTitle className="text-2xl font-bold text-lavender-700 flex items-center justify-center gap-3">
              <User className="h-6 w-6" />
              Unified Client Onboarding
            </CardTitle>
            <CardDescription className="text-base">
              Complete client screening and PMU intake in one comprehensive form
            </CardDescription>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between mb-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-lavender hover:bg-lavender/5">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Dashboard
                </Button>
              </Link>
              <div className="flex-1"></div>
            </div>
            <CardTitle className="text-3xl font-bold text-lavender-700 flex items-center justify-center gap-3">
              <User className="h-8 w-8" />
              Unified Client Onboarding
            </CardTitle>
            <CardDescription className="text-lg">
              Complete client screening and PMU intake in one comprehensive form
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Bar */}
      <Card className="border-lavender/20 bg-white">
        <CardContent className="p-4">
          {/* Mobile Layout */}
          <div className="md:hidden text-center mb-2">
            <span className="text-sm font-medium text-gray-700 block mb-1">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500 block mb-2">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-lavender h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Form Steps */}
      <Card className="border-lavender/20 bg-white">
        <CardContent className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-lavender-700 mb-2">
                  <User className="h-5 w-5 inline mr-2" />
                  Basic Information
                </h3>
                <p className="text-gray-600">Client's personal and contact details</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
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
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Emergency contact name"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    placeholder="Emergency contact phone"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Medical History */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-lavender-700 mb-2">
                  <Shield className="h-5 w-5 inline mr-2" />
                  Medical History & Screening
                </h3>
                <p className="text-gray-600">Important health information for safety assessment</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Medical Conditions</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {MEDICAL_CONDITIONS.map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={condition}
                          checked={formData.medicalConditions.includes(condition)}
                          onCheckedChange={(checked) => 
                            handleArrayChange('medicalConditions', condition, checked as boolean)
                          }
                        />
                        <Label htmlFor={condition} className="text-sm">{condition}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea
                    id="medications"
                    value={formData.medications.join(', ')}
                    onChange={(e) => handleInputChange('medications', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    placeholder="List current medications (separate with commas)"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label className="text-base font-medium">Allergies</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {ALLERGIES.map((allergy) => (
                      <div key={allergy} className="flex items-center space-x-2">
                        <Checkbox
                          id={allergy}
                          checked={formData.allergies.includes(allergy)}
                          onCheckedChange={(checked) => 
                            handleArrayChange('allergies', allergy, checked as boolean)
                          }
                        />
                        <Label htmlFor={allergy} className="text-sm">{allergy}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-medium">Skin Conditions</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {SKIN_CONDITIONS.map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={condition}
                          checked={formData.skinConditions.includes(condition)}
                          onCheckedChange={(checked) => 
                            handleArrayChange('skinConditions', condition, checked as boolean)
                          }
                        />
                        <Label htmlFor={condition} className="text-sm">{condition}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="previousPMU"
                      checked={formData.previousPMU}
                      onCheckedChange={(checked) => handleInputChange('previousPMU', checked)}
                    />
                    <Label htmlFor="previousPMU">Previous PMU experience</Label>
                  </div>
                  
                  {formData.previousPMU && (
                    <div>
                      <Label htmlFor="previousPMUDetails">Previous PMU Details</Label>
                      <Textarea
                        id="previousPMUDetails"
                        value={formData.previousPMUDetails}
                        onChange={(e) => handleInputChange('previousPMUDetails', e.target.value)}
                        placeholder="Describe previous PMU work, when it was done, and any issues"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: PMU Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-lavender-700 mb-2">
                  <Palette className="h-5 w-5 inline mr-2" />
                  PMU Service Preferences
                </h3>
                <p className="text-gray-600">Client's desired service and expectations</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="desiredService">Desired PMU Service *</Label>
                  <Select value={formData.desiredService} onValueChange={(value) => handleInputChange('desiredService', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select desired service" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {availableServices.map((service) => (
                        <SelectItem key={service} value={service}>{service}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="desiredColor">Desired Color/Tone</Label>
                  <Input
                    id="desiredColor"
                    value={formData.desiredColor}
                    onChange={(e) => handleInputChange('desiredColor', e.target.value)}
                    placeholder="e.g., Natural brown, Dark black, Warm blonde"
                  />
                </div>
                
                <div>
                  <Label htmlFor="previousExperience">Previous Experience with PMU</Label>
                  <Textarea
                    id="previousExperience"
                    value={formData.previousExperience}
                    onChange={(e) => handleInputChange('previousExperience', e.target.value)}
                    placeholder="Describe any previous experience with permanent makeup or similar procedures"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="expectations">Client Expectations</Label>
                  <Textarea
                    id="expectations"
                    value={formData.expectations}
                    onChange={(e) => handleInputChange('expectations', e.target.value)}
                    placeholder="What are the client's expectations for results, healing time, etc.?"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Lifestyle & Habits */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-lavender-700 mb-2">
                  <Heart className="h-5 w-5 inline mr-2" />
                  Lifestyle & Habits Assessment
                </h3>
                <p className="text-gray-600">Factors that may affect PMU results and healing</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sunExposure">Sun Exposure Level</Label>
                  <Select value={formData.sunExposure} onValueChange={(value) => handleInputChange('sunExposure', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sun exposure level" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {SUN_EXPOSURE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="skincareRoutine">Current Skincare Routine</Label>
                  <Textarea
                    id="skincareRoutine"
                    value={formData.skincareRoutine}
                    onChange={(e) => handleInputChange('skincareRoutine', e.target.value)}
                    placeholder="Describe current skincare products and routine"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="exerciseHabits">Exercise Habits</Label>
                  <Input
                    id="exerciseHabits"
                    value={formData.exerciseHabits}
                    onChange={(e) => handleInputChange('exerciseHabits', e.target.value)}
                    placeholder="e.g., Daily gym, Occasional walks, None"
                  />
                </div>
                
                <div>
                  <Label htmlFor="smokingStatus">Smoking Status</Label>
                  <Select value={formData.smokingStatus} onValueChange={(value) => handleInputChange('smokingStatus', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select smoking status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="Former">Former smoker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Consent & Agreements */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-lavender-700 mb-2">
                  <FileText className="h-5 w-5 inline mr-2" />
                  Consent & Legal Agreements
                </h3>
                <p className="text-gray-600">Required consents and legal agreements</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="photoConsent"
                      checked={formData.photoConsent}
                      onCheckedChange={(checked) => handleInputChange('photoConsent', checked)}
                    />
                    <Label htmlFor="photoConsent" className="text-base">
                      Photo Consent - I consent to photos being taken for treatment purposes
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medicalRelease"
                      checked={formData.medicalRelease}
                      onCheckedChange={(checked) => handleInputChange('medicalRelease', checked)}
                    />
                    <Label htmlFor="medicalRelease" className="text-base">
                      Medical Release - I authorize medical treatment if necessary
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="liabilityWaiver"
                      checked={formData.liabilityWaiver}
                      onCheckedChange={(checked) => handleInputChange('liabilityWaiver', checked)}
                    />
                    <Label htmlFor="liabilityWaiver" className="text-base">
                      Liability Waiver - I understand and accept the risks involved
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aftercareAgreement"
                      checked={formData.aftercareAgreement}
                      onCheckedChange={(checked) => handleInputChange('aftercareAgreement', checked)}
                    />
                    <Label htmlFor="aftercareAgreement" className="text-base">
                      Aftercare Agreement - I agree to follow aftercare instructions
                    </Label>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional information or special considerations"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="concerns">Client Concerns or Questions</Label>
                  <Textarea
                    id="concerns"
                    value={formData.concerns}
                    onChange={(e) => handleInputChange('concerns', e.target.value)}
                    placeholder="Any concerns, fears, or questions the client has"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="border-lavender text-lavender hover:bg-lavender/5"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                onClick={nextStep}
                className="bg-lavender hover:bg-lavender-600 text-white"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-lavender hover:bg-lavender-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Complete Onboarding
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
