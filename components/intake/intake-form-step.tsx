"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Plus, X, AlertTriangle } from "lucide-react"
import type { IntakeData } from "./contraindication-workflow"

const commonConditions = [
  "Diabetes",
  "High Blood Pressure",
  "Heart Disease",
  "Autoimmune Disorder",
  "Skin Conditions (Eczema, Psoriasis)",
  "Keloid/Hypertrophic Scarring",
  "Blood Clotting Disorders",
  "Active Skin Infection",
  "Recent Chemical Peels/Laser",
  "Pregnancy/Breastfeeding",
]

const commonMedications = [
  "Aspirin",
  "Warfarin (Coumadin)",
  "Clopidogrel (Plavix)",
  "Isotretinoin (Accutane)",
  "Prednisone",
  "Metformin",
  "Blood Pressure Medications",
  "Antibiotics",
  "Birth Control",
  "Antidepressants",
]

interface IntakeFormStepProps {
  onSubmit: (data: IntakeData) => void
}

export function IntakeFormStep({ onSubmit }: IntakeFormStepProps) {
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [selectedMedications, setSelectedMedications] = useState<string[]>([])
  const [customCondition, setCustomCondition] = useState("")
  const [customMedication, setCustomMedication] = useState("")
  const [notes, setNotes] = useState("")

  const handleConditionToggle = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition],
    )
  }

  const handleMedicationToggle = (medication: string) => {
    setSelectedMedications((prev) =>
      prev.includes(medication) ? prev.filter((m) => m !== medication) : [...prev, medication],
    )
  }

  const addCustomCondition = () => {
    if (customCondition.trim() && !selectedConditions.includes(customCondition.trim())) {
      setSelectedConditions((prev) => [...prev, customCondition.trim()])
      setCustomCondition("")
    }
  }

  const addCustomMedication = () => {
    if (customMedication.trim() && !selectedMedications.includes(customMedication.trim())) {
      setSelectedMedications((prev) => [...prev, customMedication.trim()])
      setCustomMedication("")
    }
  }

  const removeCondition = (condition: string) => {
    setSelectedConditions((prev) => prev.filter((c) => c !== condition))
  }

  const removeMedication = (medication: string) => {
    setSelectedMedications((prev) => prev.filter((m) => m !== medication))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const finalConditions = selectedConditions.length > 0 ? selectedConditions : ["none"]
    const finalMedications = selectedMedications.length > 0 ? selectedMedications : ["none"]

    onSubmit({
      conditions: finalConditions,
      medications: finalMedications,
      notes: notes.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Medical Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Medical Conditions
          </CardTitle>
          <CardDescription>
            Select any current medical conditions. This helps assess PMU safety and healing potential.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            {commonConditions.map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={`condition-${condition}`}
                  checked={selectedConditions.includes(condition)}
                  onCheckedChange={() => handleConditionToggle(condition)}
                />
                <Label htmlFor={`condition-${condition}`} className="text-sm">
                  {condition}
                </Label>
              </div>
            ))}
          </div>

          {/* Custom Condition Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add other condition..."
              value={customCondition}
              onChange={(e) => setCustomCondition(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCondition())}
            />
            <Button type="button" onClick={addCustomCondition} size="sm" variant="outline" className="bg-transparent">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected Conditions */}
          {selectedConditions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Conditions:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedConditions.map((condition) => (
                  <Badge key={condition} variant="secondary" className="gap-1">
                    {condition}
                    <button
                      type="button"
                      onClick={() => removeCondition(condition)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Medications */}
      <Card>
        <CardHeader>
          <CardTitle>Current Medications</CardTitle>
          <CardDescription>List all medications, supplements, and vitamins you're currently taking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            {commonMedications.map((medication) => (
              <div key={medication} className="flex items-center space-x-2">
                <Checkbox
                  id={`medication-${medication}`}
                  checked={selectedMedications.includes(medication)}
                  onCheckedChange={() => handleMedicationToggle(medication)}
                />
                <Label htmlFor={`medication-${medication}`} className="text-sm">
                  {medication}
                </Label>
              </div>
            ))}
          </div>

          {/* Custom Medication Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add other medication..."
              value={customMedication}
              onChange={(e) => setCustomMedication(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomMedication())}
            />
            <Button type="button" onClick={addCustomMedication} size="sm" variant="outline" className="bg-transparent">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected Medications */}
          {selectedMedications.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Medications:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedMedications.map((medication) => (
                  <Badge key={medication} variant="secondary" className="gap-1">
                    {medication}
                    <button
                      type="button"
                      onClick={() => removeMedication(medication)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>Any other relevant medical history, allergies, or concerns?</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter any additional medical information, allergies, previous PMU experiences, or specific concerns..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* High Risk Warning */}
      {(selectedMedications.some(
        (med) => med.toLowerCase().includes("isotretinoin") || med.toLowerCase().includes("accutane"),
      ) ||
        selectedConditions.some((condition) => condition.toLowerCase().includes("infection"))) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>High Risk Detected:</strong> Selected conditions or medications may contraindicate PMU procedures.
            Our AI will provide detailed safety assessment.
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" className="gap-2">
          <FileText className="h-4 w-4" />
          Analyze Safety Risk
        </Button>
      </div>
    </form>
  )
}
