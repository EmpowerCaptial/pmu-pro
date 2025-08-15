"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Printer, Mail, Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export function AftercareInstructions() {
  const [selectedProcedure, setSelectedProcedure] = useState("brows")

  const handlePrint = () => {
    window.print()
  }

  const handleEmailReminders = () => {
    // This would integrate with email service
    alert("Email reminders scheduled for healing timeline!")
  }

  const procedures = {
    brows: {
      name: "Eyebrows",
      healingTime: "30 days",
      color: "from-amber-100 to-amber-50",
      instructions: [
        {
          phase: "Days 1-7: Initial Healing",
          icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
          details: [
            "Keep brows dry for first 24 hours",
            "Gently clean with provided aftercare solution 2x daily",
            "Apply thin layer of healing balm as directed",
            "Avoid makeup, sweating, and sun exposure",
            "Do not pick, scratch, or rub the treated area",
            "Sleep on your back to avoid pillow friction",
          ],
        },
        {
          phase: "Days 8-14: Peeling Phase",
          icon: <Clock className="h-5 w-5 text-orange-600" />,
          details: [
            "Brows may appear darker and flaky - this is normal",
            "Continue gentle cleaning routine",
            "Let scabs fall off naturally - do not pick",
            "Brows may appear lighter after peeling",
            "Avoid steam, saunas, and excessive moisture",
            "Use SPF 30+ when going outside",
          ],
        },
        {
          phase: "Days 15-30: Final Healing",
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          details: [
            "True color will emerge during this phase",
            "Skin is fully healed but pigment is still settling",
            "Resume normal skincare routine (avoid acids on brows)",
            "Schedule touch-up appointment if needed",
            "Continue using SPF to protect color",
            "Brows are now ready for makeup application",
          ],
        },
      ],
    },
    lips: {
      name: "Lips",
      healingTime: "30 days",
      color: "from-rose-100 to-rose-50",
      instructions: [
        {
          phase: "Days 1-7: Initial Healing",
          icon: <AlertTriangle className="h-5 w-5 text-rose-600" />,
          details: [
            "Keep lips moist with provided healing balm",
            "Avoid spicy, acidic, or hot foods/drinks",
            "Use a straw for drinking",
            "Gently clean with damp cotton pad 2x daily",
            "No kissing or oral contact",
            "Sleep with head elevated to reduce swelling",
          ],
        },
        {
          phase: "Days 8-14: Peeling Phase",
          icon: <Clock className="h-5 w-5 text-pink-600" />,
          details: [
            "Lips will feel tight and may crack - keep moisturized",
            "Color may appear uneven as skin peels",
            "Continue avoiding acidic foods",
            "Do not pick or bite peeling skin",
            "Use gentle, fragrance-free lip products",
            "Avoid direct sun exposure",
          ],
        },
        {
          phase: "Days 15-30: Final Healing",
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          details: [
            "True color will develop during this phase",
            "Resume normal eating and drinking habits",
            "Can wear lipstick over healed PMU",
            "Schedule touch-up if color needs adjustment",
            "Use SPF lip balm for color protection",
            "Lips are now fully healed and ready",
          ],
        },
      ],
    },
    eyeliner: {
      name: "Eyeliner",
      healingTime: "30 days",
      color: "from-purple-100 to-purple-50",
      instructions: [
        {
          phase: "Days 1-7: Initial Healing",
          icon: <AlertTriangle className="h-5 w-5 text-purple-600" />,
          details: [
            "Keep eyes clean and dry for first 24 hours",
            "Gently clean with provided solution using cotton swab",
            "Apply healing ointment sparingly",
            "Avoid eye makeup and contact lenses",
            "No swimming, saunas, or steam rooms",
            "Sleep with head elevated to reduce swelling",
          ],
        },
        {
          phase: "Days 8-14: Peeling Phase",
          icon: <Clock className="h-5 w-5 text-indigo-600" />,
          details: [
            "Eyeliner may appear darker and flaky",
            "Continue gentle cleaning routine",
            "Do not rub or scratch the eye area",
            "Avoid waterproof makeup removers",
            "Use preservative-free eye drops if needed",
            "Protect from sun with sunglasses",
          ],
        },
        {
          phase: "Days 15-30: Final Healing",
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          details: [
            "Final color and shape will be visible",
            "Can resume normal eye makeup routine",
            "Use gentle makeup removers",
            "Schedule touch-up appointment if needed",
            "Continue protecting with sunglasses",
            "Eyeliner is now fully healed",
          ],
        },
      ],
    },
  }

  return (
    <div className="space-y-6">
      {/* Procedure Selection */}
      <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
        <CardHeader>
          <CardTitle className="font-serif text-lavender-600">Select Procedure</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedProcedure} onValueChange={setSelectedProcedure}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="brows" className="font-bold">
                EYEBROWS
              </TabsTrigger>
              <TabsTrigger value="lips" className="font-bold">
                LIPS
              </TabsTrigger>
              <TabsTrigger value="eyeliner" className="font-bold">
                EYELINER
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 print:hidden">
        <Button onClick={handlePrint} className="gap-2 bg-gradient-to-r from-lavender to-lavender-600">
          <Printer className="h-4 w-4" />
          Print Instructions
        </Button>
        <Button
          onClick={handleEmailReminders}
          variant="outline"
          className="gap-2 border-lavender text-lavender hover:bg-lavender/10 bg-transparent"
        >
          <Mail className="h-4 w-4" />
          Schedule Email Reminders
        </Button>
      </div>

      {/* Instructions */}
      <div className="space-y-6">
        <Card className={`border-lavender/20 bg-gradient-to-r ${procedures[selectedProcedure].color}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-2xl">
                {procedures[selectedProcedure].name} Aftercare Instructions
              </CardTitle>
              <Badge variant="secondary" className="bg-lavender/20 text-lavender-700">
                <Calendar className="h-3 w-3 mr-1" />
                {procedures[selectedProcedure].healingTime} healing
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {procedures[selectedProcedure].instructions.map((phase, index) => (
          <Card key={index} className="border-lavender/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-serif text-lg">
                {phase.icon}
                {phase.phase}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {phase.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-lavender rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{detail}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}

        {/* Important Notes */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 font-serif flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-red-600 space-y-2">
            <p>
              • Contact your PMU artist immediately if you experience excessive swelling, pus, or signs of infection
            </p>
            <p>• Avoid blood thinners, alcohol, and excessive caffeine during healing</p>
            <p>• Do not use retinoids, AHA/BHA, or vitamin C serums on treated areas</p>
            <p>• Touch-up appointments are typically scheduled 6-8 weeks after initial procedure</p>
            <p>• Results may vary based on skin type, lifestyle, and aftercare compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .bg-gradient-to-br,
          .bg-gradient-to-r {
            background: white !important;
          }
        }
      `}</style>
    </div>
  )
}
