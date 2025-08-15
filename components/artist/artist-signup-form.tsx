"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, MapPin, Award } from "lucide-react"

export function ArtistSignupForm() {
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    licenseNumber: "",
    licenseState: "",
    yearsExperience: "",
    specialties: [] as string[],
    portfolio: null as File | null,
    license: null as File | null,
    insurance: null as File | null,
    agreed: false,
  })

  const specialtyOptions = [
    "Eyebrows",
    "Lips",
    "Eyeliner",
    "Scalp Micropigmentation",
    "Areola Restoration",
    "Scar Camouflage",
  ]

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, specialties: [...formData.specialties, specialty] })
    } else {
      setFormData({ ...formData, specialties: formData.specialties.filter((s) => s !== specialty) })
    }
  }

  const handleSubmit = async () => {
    if (!formData.agreed) {
      alert("Please agree to the terms and conditions")
      return
    }
    // This would submit to approval system
    alert("Application submitted! We'll review your credentials and contact you within 3-5 business days.")
  }

  return (
    <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
      <CardHeader>
        <CardTitle className="font-serif text-lavender-600 text-center">Professional Artist Registration</CardTitle>
        <p className="text-muted-foreground text-center">
          Join our network of licensed PMU professionals and connect with qualified clients
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-lavender-600 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Your PMU Studio Name"
              />
            </div>
            <div>
              <Label htmlFor="ownerName">Owner/Artist Name *</Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="Your full name"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Business Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="business@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Business Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Business Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main Street"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
              />
            </div>
            <div>
              <Label htmlFor="zipCode">Zip Code *</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                placeholder="12345"
              />
            </div>
          </div>
        </div>

        {/* License Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-lavender-600 flex items-center gap-2">
            <Award className="h-5 w-5" />
            License & Credentials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="licenseNumber">License Number *</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder="License #"
              />
            </div>
            <div>
              <Label htmlFor="licenseState">License State *</Label>
              <Input
                id="licenseState"
                value={formData.licenseState}
                onChange={(e) => setFormData({ ...formData, licenseState: e.target.value })}
                placeholder="State"
              />
            </div>
            <div>
              <Label htmlFor="yearsExperience">Years Experience *</Label>
              <Input
                id="yearsExperience"
                value={formData.yearsExperience}
                onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                placeholder="5"
              />
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-lavender-600">Specialties</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {specialtyOptions.map((specialty) => (
              <div key={specialty} className="flex items-center space-x-2">
                <Checkbox
                  id={specialty}
                  checked={formData.specialties.includes(specialty)}
                  onCheckedChange={(checked) => handleSpecialtyChange(specialty, checked as boolean)}
                />
                <Label htmlFor={specialty} className="text-sm">
                  {specialty}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* File Uploads */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-lavender-600 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Required Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="license">License Copy *</Label>
              <Input
                id="license"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFormData({ ...formData, license: e.target.files?.[0] || null })}
              />
            </div>
            <div>
              <Label htmlFor="insurance">Insurance Certificate *</Label>
              <Input
                id="insurance"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFormData({ ...formData, insurance: e.target.files?.[0] || null })}
              />
            </div>
            <div>
              <Label htmlFor="portfolio">Portfolio (Optional)</Label>
              <Input
                id="portfolio"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.files?.[0] || null })}
              />
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreed"
              checked={formData.agreed}
              onCheckedChange={(checked) => setFormData({ ...formData, agreed: checked as boolean })}
            />
            <Label htmlFor="agreed" className="text-sm leading-relaxed">
              I agree to the terms and conditions, privacy policy, and understand that my application will be reviewed
              for approval. I certify that all information provided is accurate and that I maintain current licensing
              and insurance.
            </Label>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender-700 py-3"
          disabled={!formData.agreed}
        >
          Submit Application for Review
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          <p>Applications are typically reviewed within 3-5 business days.</p>
          <p>You'll receive an email confirmation once approved.</p>
        </div>
      </CardContent>
    </Card>
  )
}
