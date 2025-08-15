"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, Shield, Eye } from "lucide-react"

interface BiometricConsentProps {
  onConsent: () => void
  onDecline: () => void
}

export function BiometricConsent({ onConsent, onDecline }: BiometricConsentProps) {
  const [hasReadTerms, setHasReadTerms] = useState(false)
  const [hasConsented, setHasConsented] = useState(false)

  const handleProceed = () => {
    if (hasReadTerms && hasConsented) {
      onConsent()
    }
  }

  return (
    <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-sage to-sage-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-serif text-foreground">Biometric Data Notice & Consent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Important Medical Disclaimer</p>
            <p>
              This simulation does not provide medical advice. Results are for comparative analysis only and should not
              replace professional medical consultation.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Purpose of Biometric Data Collection
          </h3>
          <div className="text-sm text-muted-foreground space-y-2 pl-6">
            <p>
              • <strong>Personal Comparative Analysis:</strong> Your facial image will be analyzed to determine
              Fitzpatrick skin type and undertone characteristics
            </p>
            <p>
              • <strong>Pigment Matching:</strong> AI analysis provides personalized PMU pigment recommendations based
              on your unique skin characteristics
            </p>
            <p>
              • <strong>Professional Use Only:</strong> Results are intended for use by qualified PMU professionals in
              consultation planning
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Data Handling & Privacy</h3>
          <div className="text-sm text-muted-foreground space-y-2 pl-6">
            <p>• Your image is processed securely and is not stored permanently</p>
            <p>• Analysis results may be saved to your client profile for consultation records</p>
            <p>• No biometric data is shared with third parties</p>
            <p>• You may request deletion of your data at any time</p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="read-terms"
              checked={hasReadTerms}
              onCheckedChange={(checked) => setHasReadTerms(checked as boolean)}
            />
            <label htmlFor="read-terms" className="text-sm text-muted-foreground leading-relaxed">
              I have read and understand the purpose of biometric data collection and the medical disclaimer above
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="consent"
              checked={hasConsented}
              onCheckedChange={(checked) => setHasConsented(checked as boolean)}
            />
            <label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed">
              I consent to the collection and analysis of my biometric data for the purpose of personal comparative
              analysis and PMU consultation planning
            </label>
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <Button variant="outline" onClick={onDecline} className="flex-1 bg-transparent">
            Decline
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!hasReadTerms || !hasConsented}
            className="flex-1 bg-gradient-to-r from-sage to-sage-600 hover:from-sage-600 hover:to-sage"
          >
            Proceed with Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
