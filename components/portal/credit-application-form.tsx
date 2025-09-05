"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Building, 
  PiggyBank, 
  CreditCard, 
  User, 
  MapPin, 
  Briefcase, 
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'
import { CreditApplication, BankAccount, CreditCard as CreditCardType, Loan } from '@/types/client-portal'
import { PointSystemService } from '@/lib/point-system-service'

interface CreditApplicationFormProps {
  clientId: string
  onApplicationUpdate?: (application: CreditApplication) => void
}

export function CreditApplicationForm({ clientId, onApplicationUpdate }: CreditApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [application, setApplication] = useState<CreditApplication>({
    id: `credit_${clientId}`,
    clientId,
    status: 'draft',
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      ssn: '',
      email: '',
      phone: ''
    },
    address: {
      currentAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        timeAtAddress: '',
        rentOwn: 'rent'
      }
    },
    employment: {
      employerName: '',
      jobTitle: '',
      employmentType: 'full_time',
      timeEmployed: '',
      monthlyIncome: 0,
      employerPhone: '',
      employerAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    },
    financial: {
      monthlyRent: 0,
      otherMonthlyObligations: 0,
      bankAccounts: [],
      creditCards: [],
      loans: [],
      totalMonthlyObligations: 0
    },
    procedure: {
      requestedAmount: 0,
      procedureType: '',
      estimatedCost: 0,
      downPayment: 0,
      financingAmount: 0,
      preferredTerm: 12,
      urgency: 'flexible'
    },
    consent: {
      creditCheck: false,
      termsAccepted: false,
      privacyPolicyAccepted: false,
      marketingConsent: false,
      electronicCommunication: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  })

  const pointSystem = PointSystemService.getInstance()

  const updateApplication = (updates: Partial<CreditApplication>) => {
    const updated = { ...application, ...updates, updatedAt: new Date() }
    setApplication(updated)
    onApplicationUpdate?.(updated)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Update the application in the point system
      pointSystem.updateCreditApplication(clientId, application)
      const submitted = pointSystem.submitCreditApplication(clientId)
      
      alert('Credit application submitted successfully! You will receive a response within 24-48 hours.')
      setCurrentStep(6) // Show confirmation
    } catch (error) {
      alert('Error submitting application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Address Information', icon: MapPin },
    { id: 3, title: 'Employment Information', icon: Briefcase },
    { id: 4, title: 'Financial Information', icon: DollarSign },
    { id: 5, title: 'Procedure Details', icon: CreditCard },
    { id: 6, title: 'Review & Submit', icon: Shield }
  ]

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            currentStep >= step.id ? 'bg-lavender border-lavender text-white' : 'border-gray-300 text-gray-500'
          }`}>
            <step.icon className="h-5 w-5" />
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-2 ${
              currentStep > step.id ? 'bg-lavender' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={application.personalInfo.firstName}
            onChange={(e) => updateApplication({
              personalInfo: { ...application.personalInfo, firstName: e.target.value }
            })}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={application.personalInfo.lastName}
            onChange={(e) => updateApplication({
              personalInfo: { ...application.personalInfo, lastName: e.target.value }
            })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={application.personalInfo.dateOfBirth}
            onChange={(e) => updateApplication({
              personalInfo: { ...application.personalInfo, dateOfBirth: e.target.value }
            })}
            required
          />
        </div>
        <div>
          <Label htmlFor="ssn">Social Security Number *</Label>
          <Input
            id="ssn"
            value={application.personalInfo.ssn}
            onChange={(e) => updateApplication({
              personalInfo: { ...application.personalInfo, ssn: e.target.value }
            })}
            placeholder="123-45-6789"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={application.personalInfo.email}
            onChange={(e) => updateApplication({
              personalInfo: { ...application.personalInfo, email: e.target.value }
            })}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={application.personalInfo.phone}
            onChange={(e) => updateApplication({
              personalInfo: { ...application.personalInfo, phone: e.target.value }
            })}
            required
          />
        </div>
      </div>
    </div>
  )

  const renderAddressInfo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Current Address</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="street">Street Address *</Label>
          <Input
            id="street"
            value={application.address.currentAddress.street}
            onChange={(e) => updateApplication({
              address: {
                ...application.address,
                currentAddress: { ...application.address.currentAddress, street: e.target.value }
              }
            })}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={application.address.currentAddress.city}
              onChange={(e) => updateApplication({
                address: {
                  ...application.address,
                  currentAddress: { ...application.address.currentAddress, city: e.target.value }
                }
              })}
              required
            />
          </div>
          <div>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              value={application.address.currentAddress.state}
              onChange={(e) => updateApplication({
                address: {
                  ...application.address,
                  currentAddress: { ...application.address.currentAddress, state: e.target.value }
                }
              })}
              required
            />
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP Code *</Label>
            <Input
              id="zipCode"
              value={application.address.currentAddress.zipCode}
              onChange={(e) => updateApplication({
                address: {
                  ...application.address,
                  currentAddress: { ...application.address.currentAddress, zipCode: e.target.value }
                }
              })}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="timeAtAddress">Time at Address *</Label>
            <Input
              id="timeAtAddress"
              value={application.address.currentAddress.timeAtAddress}
              onChange={(e) => updateApplication({
                address: {
                  ...application.address,
                  currentAddress: { ...application.address.currentAddress, timeAtAddress: e.target.value }
                }
              })}
              placeholder="e.g., 2 years 6 months"
              required
            />
          </div>
          <div>
            <Label htmlFor="rentOwn">Rent or Own *</Label>
            <Select
              value={application.address.currentAddress.rentOwn}
              onValueChange={(value: 'rent' | 'own') => updateApplication({
                address: {
                  ...application.address,
                  currentAddress: { ...application.address.currentAddress, rentOwn: value }
                }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="own">Own</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderEmploymentInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employerName">Employer Name *</Label>
          <Input
            id="employerName"
            value={application.employment.employerName}
            onChange={(e) => updateApplication({
              employment: { ...application.employment, employerName: e.target.value }
            })}
            required
          />
        </div>
        <div>
          <Label htmlFor="jobTitle">Job Title *</Label>
          <Input
            id="jobTitle"
            value={application.employment.jobTitle}
            onChange={(e) => updateApplication({
              employment: { ...application.employment, jobTitle: e.target.value }
            })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employmentType">Employment Type *</Label>
          <Select
            value={application.employment.employmentType}
            onValueChange={(value: any) => updateApplication({
              employment: { ...application.employment, employmentType: value }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="self_employed">Self Employed</SelectItem>
              <SelectItem value="unemployed">Unemployed</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="timeEmployed">Time Employed *</Label>
          <Input
            id="timeEmployed"
            value={application.employment.timeEmployed}
            onChange={(e) => updateApplication({
              employment: { ...application.employment, timeEmployed: e.target.value }
            })}
            placeholder="e.g., 3 years 2 months"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="monthlyIncome">Monthly Income *</Label>
          <Input
            id="monthlyIncome"
            type="number"
            value={application.employment.monthlyIncome}
            onChange={(e) => updateApplication({
              employment: { ...application.employment, monthlyIncome: parseFloat(e.target.value) || 0 }
            })}
            required
          />
        </div>
        <div>
          <Label htmlFor="employerPhone">Employer Phone *</Label>
          <Input
            id="employerPhone"
            type="tel"
            value={application.employment.employerPhone}
            onChange={(e) => updateApplication({
              employment: { ...application.employment, employerPhone: e.target.value }
            })}
            required
          />
        </div>
      </div>
    </div>
  )

  const renderFinancialInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="monthlyRent">Monthly Rent/Mortgage *</Label>
          <Input
            id="monthlyRent"
            type="number"
            value={application.financial.monthlyRent}
            onChange={(e) => updateApplication({
              financial: { ...application.financial, monthlyRent: parseFloat(e.target.value) || 0 }
            })}
            required
          />
        </div>
        <div>
          <Label htmlFor="otherObligations">Other Monthly Obligations *</Label>
          <Input
            id="otherObligations"
            type="number"
            value={application.financial.otherMonthlyObligations}
            onChange={(e) => updateApplication({
              financial: { ...application.financial, otherMonthlyObligations: parseFloat(e.target.value) || 0 }
            })}
            required
          />
        </div>
      </div>
    </div>
  )

  const renderProcedureInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="procedureType">Procedure Type *</Label>
          <Input
            id="procedureType"
            value={application.procedure.procedureType}
            onChange={(e) => updateApplication({
              procedure: { ...application.procedure, procedureType: e.target.value }
            })}
            placeholder="e.g., Microblading, Lip Blush, Eyeliner"
            required
          />
        </div>
        <div>
          <Label htmlFor="requestedAmount">Requested Amount *</Label>
          <Input
            id="requestedAmount"
            type="number"
            value={application.procedure.requestedAmount}
            onChange={(e) => updateApplication({
              procedure: { ...application.procedure, requestedAmount: parseFloat(e.target.value) || 0 }
            })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="downPayment">Down Payment</Label>
          <Input
            id="downPayment"
            type="number"
            value={application.procedure.downPayment}
            onChange={(e) => updateApplication({
              procedure: { ...application.procedure, downPayment: parseFloat(e.target.value) || 0 }
            })}
          />
        </div>
        <div>
          <Label htmlFor="preferredTerm">Preferred Term *</Label>
          <Select
            value={application.procedure.preferredTerm.toString()}
            onValueChange={(value) => updateApplication({
              procedure: { ...application.procedure, preferredTerm: parseInt(value) as any }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">12 months</SelectItem>
              <SelectItem value="18">18 months</SelectItem>
              <SelectItem value="24">24 months</SelectItem>
              <SelectItem value="36">36 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="urgency">Urgency *</Label>
        <Select
          value={application.procedure.urgency}
          onValueChange={(value: any) => updateApplication({
            procedure: { ...application.procedure, urgency: value }
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">Immediate (within 7 days)</SelectItem>
            <SelectItem value="within_30_days">Within 30 days</SelectItem>
            <SelectItem value="within_90_days">Within 90 days</SelectItem>
            <SelectItem value="flexible">Flexible timing</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderConsent = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="creditCheck"
            checked={application.consent.creditCheck}
            onCheckedChange={(checked) => updateApplication({
              consent: { ...application.consent, creditCheck: checked as boolean }
            })}
          />
          <Label htmlFor="creditCheck">I authorize a credit check to be performed</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="termsAccepted"
            checked={application.consent.termsAccepted}
            onCheckedChange={(checked) => updateApplication({
              consent: { ...application.consent, termsAccepted: checked as boolean }
            })}
          />
          <Label htmlFor="termsAccepted">I accept the terms and conditions</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="privacyPolicyAccepted"
            checked={application.consent.privacyPolicyAccepted}
            onCheckedChange={(checked) => updateApplication({
              consent: { ...application.consent, privacyPolicyAccepted: checked as boolean }
            })}
          />
          <Label htmlFor="privacyPolicyAccepted">I accept the privacy policy</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="marketingConsent"
            checked={application.consent.marketingConsent}
            onCheckedChange={(checked) => updateApplication({
              consent: { ...application.consent, marketingConsent: checked as boolean }
            })}
          />
          <Label htmlFor="marketingConsent">I consent to receive marketing communications</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="electronicCommunication"
            checked={application.consent.electronicCommunication}
            onCheckedChange={(checked) => updateApplication({
              consent: { ...application.consent, electronicCommunication: checked as boolean }
            })}
          />
          <Label htmlFor="electronicCommunication">I consent to electronic communication</Label>
        </div>
      </div>
    </div>
  )

  const renderReview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Application Review
          </CardTitle>
          <CardDescription>Please review your information before submitting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Personal Information</h4>
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {application.personalInfo.firstName} {application.personalInfo.lastName}</p>
                <p><strong>Email:</strong> {application.personalInfo.email}</p>
                <p><strong>Phone:</strong> {application.personalInfo.phone}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Procedure Information</h4>
              <div className="text-sm space-y-1">
                <p><strong>Procedure:</strong> {application.procedure.procedureType}</p>
                <p><strong>Amount:</strong> ${application.procedure.requestedAmount}</p>
                <p><strong>Term:</strong> {application.procedure.preferredTerm} months</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderPersonalInfo()
      case 2: return renderAddressInfo()
      case 3: return renderEmploymentInfo()
      case 4: return renderFinancialInfo()
      case 5: return renderProcedureInfo()
      case 6: return renderReview()
      default: return renderPersonalInfo()
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return application.personalInfo.firstName && application.personalInfo.lastName && 
               application.personalInfo.dateOfBirth && application.personalInfo.ssn && 
               application.personalInfo.email && application.personalInfo.phone
      case 2:
        return application.address.currentAddress.street && application.address.currentAddress.city && 
               application.address.currentAddress.state && application.address.currentAddress.zipCode && 
               application.address.currentAddress.timeAtAddress
      case 3:
        return application.employment.employerName && application.employment.jobTitle && 
               application.employment.timeEmployed && application.employment.monthlyIncome > 0 && 
               application.employment.employerPhone
      case 4:
        return application.financial.monthlyRent >= 0 && application.financial.otherMonthlyObligations >= 0
      case 5:
        return application.procedure.procedureType && application.procedure.requestedAmount > 0
      case 6:
        return application.consent.creditCheck && application.consent.termsAccepted && 
               application.consent.privacyPolicyAccepted
      default:
        return false
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Credit Application
          </CardTitle>
          <CardDescription>
            Apply for financing to make your dream procedure more affordable
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepIndicator()}
          
          {renderStepContent()}

          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {currentStep < 6 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceed()}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

