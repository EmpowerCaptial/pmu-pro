"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Stepper } from "@/components/ui/stepper"
import { Camera, MapPin, Send } from "lucide-react"

export function ClientAnalysisWorkflow() {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    zipCode: "",
    skinType: "",
    eyeColor: "",
    hairColor: "",
    undertone: "",
    procedure: "",
    experience: "",
    concerns: "",
    photo: null as File | null,
  })

  const steps = ["Personal Info", "Skin Analysis", "Photo Upload", "Find Artists"]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    alert(
      "Analysis complete! Your results have been sent to licensed PMU artists in your area. You'll receive contact within 24 hours.",
    )

    setTimeout(() => {
      router.push("/")
    }, 2000) // 2 second delay to allow user to read the success message
  }

  return (
    <div className="space-y-6">
      <Stepper steps={steps} currentStep={currentStep} />

      <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
        <CardHeader>
          <CardTitle className="font-serif text-lavender-600">{steps[currentStep]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
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
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-4 block">Select Your Skin Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { id: "type1", label: "Type I", desc: "Very fair, always burns", image: "/pale-skin-portrait.png" },
                    { id: "type2", label: "Type II", desc: "Fair, usually burns", image: "/fair-skin-portrait.png" },
                    {
                      id: "type3",
                      label: "Type III",
                      desc: "Medium, sometimes burns",
                      image: "/light-medium-skin-portrait.png",
                    },
                    { id: "type4", label: "Type IV", desc: "Olive, rarely burns", image: "/medium-skin-portrait.png" },
                    {
                      id: "type5",
                      label: "Type V",
                      desc: "Brown, very rarely burns",
                      image: "/medium-dark-skin-portrait.png",
                    },
                    { id: "type6", label: "Type VI", desc: "Dark, never burns", image: "/dark-skin-portrait.png" },
                  ].map((type) => (
                    <div
                      key={type.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        formData.skinType === type.id
                          ? "border-lavender shadow-lg scale-105"
                          : "border-gray-200 hover:border-lavender/50"
                      }`}
                      onClick={() => setFormData({ ...formData, skinType: type.id })}
                    >
                      <img
                        src={type.image || "/placeholder.svg"}
                        alt={`${type.label} skin type`}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 text-white">
                        <div className="font-semibold text-sm">{type.label}</div>
                        <div className="text-xs opacity-90">{type.desc}</div>
                      </div>
                      {formData.skinType === type.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-lavender rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="eyeColor">Eye Color</Label>
                  <RadioGroup
                    value={formData.eyeColor}
                    onValueChange={(value) => setFormData({ ...formData, eyeColor: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="brown" id="brown" />
                      <Label htmlFor="brown">Brown</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="blue" id="blue" />
                      <Label htmlFor="blue">Blue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="green" id="green" />
                      <Label htmlFor="green">Green</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hazel" id="hazel" />
                      <Label htmlFor="hazel">Hazel</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="hairColor">Hair Color</Label>
                  <RadioGroup
                    value={formData.hairColor}
                    onValueChange={(value) => setFormData({ ...formData, hairColor: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="blonde" id="blonde" />
                      <Label htmlFor="blonde">Blonde</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="brunette" id="brunette" />
                      <Label htmlFor="brunette">Brunette</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="black" id="black" />
                      <Label htmlFor="black">Black</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="red" id="red" />
                      <Label htmlFor="red">Red</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gray" id="gray" />
                      <Label htmlFor="gray">Gray/Silver</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="undertone">Undertone</Label>
                  <RadioGroup
                    value={formData.undertone}
                    onValueChange={(value) => setFormData({ ...formData, undertone: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="warm" id="warm" />
                      <Label htmlFor="warm">Warm</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cool" id="cool" />
                      <Label htmlFor="cool">Cool</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="neutral" id="neutral" />
                      <Label htmlFor="neutral">Neutral</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div>
                <Label htmlFor="procedure">Interested Procedure</Label>
                <RadioGroup
                  value={formData.procedure}
                  onValueChange={(value) => setFormData({ ...formData, procedure: value })}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="brows" id="brows" />
                    <Label htmlFor="brows">Eyebrows</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lips" id="lips" />
                    <Label htmlFor="lips">Lips</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="eyeliner" id="eyeliner" />
                    <Label htmlFor="eyeliner">Eyeliner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple" id="multiple" />
                    <Label htmlFor="multiple">Multiple procedures</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Camera className="h-16 w-16 text-lavender-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload a Clear Photo</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Please upload a clear, well-lit photo of your face for accurate analysis
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, photo: e.target.files?.[0] || null })}
                  className="mb-4"
                />
              </div>

              <div>
                <Label htmlFor="concerns">Any specific concerns or questions?</Label>
                <Textarea
                  id="concerns"
                  value={formData.concerns}
                  onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
                  placeholder="Tell us about any concerns, previous PMU experience, or specific goals..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <MapPin className="h-16 w-16 text-lavender-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Finding Licensed Artists Near You</h3>
                <p className="text-muted-foreground">
                  Based on your location ({formData.zipCode}), we're connecting you with licensed PMU artists in your
                  area.
                </p>
              </div>

              <Card className="border-lavender/20 bg-gradient-to-r from-lavender/5 to-beige/10 p-6">
                <h4 className="font-semibold text-lavender-600 mb-3">What happens next?</h4>
                <ul className="text-sm text-left space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-lavender rounded-full mt-2 flex-shrink-0"></div>
                    <span>Your analysis is sent to 3-5 licensed artists in your area</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-lavender rounded-full mt-2 flex-shrink-0"></div>
                    <span>Artists review your skin type and procedure interests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-lavender rounded-full mt-2 flex-shrink-0"></div>
                    <span>You'll receive personalized consultations within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-lavender rounded-full mt-2 flex-shrink-0"></div>
                    <span>Choose the artist that best fits your needs and budget</span>
                  </li>
                </ul>
              </Card>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              onClick={handleBack}
              disabled={currentStep === 0}
              variant="outline"
              className="border-lavender text-lavender hover:bg-lavender/10 bg-transparent"
            >
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender-700 gap-2"
              >
                <Send className="h-4 w-4" />
                Send to Artists
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
