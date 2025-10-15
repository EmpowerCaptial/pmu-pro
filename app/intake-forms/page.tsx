"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useState } from "react"
import { NavBar } from "@/components/ui/navbar"
import { useDemoAuth } from "@/hooks/use-demo-auth"

export default function IntakeFormsPage() {
  const { currentUser } = useDemoAuth()
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    address: "",
    phone: "",
    email: "",
    emergencyContact: "",
    emergencyPhone: "",
    occupation: "",
    medicalHistory: [] as string[],
    allergies: "",
    medications: "",
    photoConsent: "",
    clientSignature: "",
    artistSignature: "",
    date: new Date().toISOString().split("T")[0],
  })

  const medicalConditions = [
    "Diabetes",
    "Epilepsy/Seizures",
    "Skin Disorders (eczema, psoriasis, etc.)",
    "Pregnancy or Nursing",
    "Heart Conditions",
    "Blood Disorders",
    "Keloid Scarring",
    "Previous Permanent Makeup/Tattoos",
  ]

  const handleMedicalHistoryChange = (condition: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: checked
        ? [...prev.medicalHistory, condition]
        : prev.medicalHistory.filter((item) => item !== condition),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
    alert("Intake form completed successfully!")
  }

  return (
    <div className="min-h-screen bg-beige/20 py-8">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/images/pmu-guide-logo-transparent.png"
          alt="PMU Guide Watermark"
          className="w-[60%] max-w-2xl h-auto opacity-[0.03] object-contain"
        />
      </div>

      <div className="container mx-auto max-w-4xl px-4 relative z-10">
        <NavBar />
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4 bg-transparent">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-ink mb-2">PMU-GUIDE Client Intake & Consent Forms</h1>
          <p className="text-ink/70">Professional intake and consent documentation for PMU procedures</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="bg-white border-lavender/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-ink">1. Client Intake Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emergencyPhone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => setFormData((prev) => ({ ...prev, occupation: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-lavender/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-ink">2. Medical History Checklist</CardTitle>
              <p className="text-ink/70">Check all that apply</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {medicalConditions.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      checked={formData.medicalHistory.includes(condition)}
                      onCheckedChange={(checked) => handleMedicalHistoryChange(condition, checked as boolean)}
                    />
                    <Label htmlFor={condition} className="text-sm">
                      {condition}
                    </Label>
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="allergies">Allergies (inks/metals/latex)</Label>
                <Textarea
                  id="allergies"
                  placeholder="Please list any known allergies..."
                  value={formData.allergies}
                  onChange={(e) => setFormData((prev) => ({ ...prev, allergies: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  placeholder="Please list all current medications..."
                  value={formData.medications}
                  onChange={(e) => setFormData((prev) => ({ ...prev, medications: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-lavender/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-ink">3. Procedure Consent & Liability Waiver</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-beige/30 p-6 rounded-lg mb-4">
                <p className="text-ink text-sm leading-relaxed">
                  I understand that permanent makeup is a form of tattooing. I acknowledge that all procedures involve
                  inherent risks including, but not limited to: infection, allergic reaction, scarring, and
                  dissatisfaction with the results. I release and hold harmless the artist and PMU-GUIDE from any
                  liability. I confirm that I have disclosed all medical history and conditions truthfully. I understand
                  that results may vary and require maintenance or touch-ups.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="consentAgreement" required />
                <Label htmlFor="consentAgreement" className="text-sm">
                  I have read and agree to the above consent and liability waiver
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-lavender/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-ink">4. Photo Release Consent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-beige/30 p-6 rounded-lg mb-4">
                <p className="text-ink text-sm leading-relaxed">
                  I consent to the taking of photographs and/or videos before, during, and after my procedure(s). I
                  understand these images may be used for documentation, educational, and promotional purposes by
                  PMU-GUIDE.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="photoYes"
                    name="photoConsent"
                    value="yes"
                    onChange={(e) => setFormData((prev) => ({ ...prev, photoConsent: e.target.value }))}
                  />
                  <Label htmlFor="photoYes" className="text-sm">
                    Yes, I consent to photo/video documentation
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="photoNo"
                    name="photoConsent"
                    value="no"
                    onChange={(e) => setFormData((prev) => ({ ...prev, photoConsent: e.target.value }))}
                  />
                  <Label htmlFor="photoNo" className="text-sm">
                    No, I do not consent to photo/video documentation
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-lavender/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-ink">5. Acknowledgement & Signature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-beige/30 p-6 rounded-lg">
                <p className="text-ink text-sm leading-relaxed">
                  I confirm that I have read and understood the above forms. I acknowledge that all information provided
                  is true and accurate. I consent to proceed under these terms.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientSignature">Client Signature</Label>
                  <Input
                    id="clientSignature"
                    placeholder="Type your full name as signature"
                    value={formData.clientSignature}
                    onChange={(e) => setFormData((prev) => ({ ...prev, clientSignature: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="artistSignature">Artist Signature</Label>
                  <Input
                    id="artistSignature"
                    placeholder="Artist signature"
                    value={formData.artistSignature}
                    onChange={(e) => setFormData((prev) => ({ ...prev, artistSignature: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" className="bg-lavender hover:bg-lavender-600 text-white px-8 py-3">
              Complete Intake Form
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-lavender text-lavender hover:bg-lavender/5 px-8 py-3 bg-transparent"
              onClick={() => window.print()}
            >
              Print Form
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
