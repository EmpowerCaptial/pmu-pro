"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Sun, Download, Save, Sparkles } from "lucide-react"

interface FitzpatrickType {
  id: string
  name: string
  description: string
  image: string
}

interface AnalysisResult {
  type: string
  confidence: number
  pigments: Array<{
    name: string
    hex: string
    code: string
  }>
  techniques: {
    needleSpeed: string
    depth: string
    care: string
  }
  reasoning: string
}

interface Props {
  onAnalyze: (formState: any) => Promise<AnalysisResult>
  onSave: (result: AnalysisResult) => void
  onExport: (result: AnalysisResult) => void
}

const fitzpatrickTypes: FitzpatrickType[] = [
  {
    id: "I",
    name: "Type I",
    description: "Always burns, never tans",
    image: "/pale-skin-portrait.png",
  },
  {
    id: "II",
    name: "Type II",
    description: "Usually burns, tans minimally",
    image: "/fair-skin-portrait.png",
  },
  {
    id: "III",
    name: "Type III",
    description: "Sometimes burns, tans gradually",
    image: "/light-medium-skin-portrait.png",
  },
  {
    id: "IV",
    name: "Type IV",
    description: "Burns minimally, tans well",
    image: "/medium-skin-portrait.png",
  },
  {
    id: "V",
    name: "Type V",
    description: "Rarely burns, tans deeply",
    image: "/medium-dark-skin-portrait.png",
  },
  {
    id: "VI",
    name: "Type VI",
    description: "Never burns, deeply pigmented",
    image: "/dark-skin-portrait.png",
  },
]

export default function FitzpatrickProSelector({ onAnalyze, onSave, onExport }: Props) {
  const [selectedType, setSelectedType] = useState<string>("")
  const [tone, setTone] = useState([50])
  const [undertone, setUndertone] = useState("neutral")
  const [sunResponse, setSunResponse] = useState("sometimes")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const analysisResult = await onAnalyze({
        selectedType,
        tone: tone[0],
        undertone,
        sunResponse,
      })
      setResult(analysisResult)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4 transform transition-transform duration-300 hover:scale-[1.02]">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-lavender to-lavender-600 bg-clip-text text-transparent">
          Fitzpatrick Pro Selector
        </h1>
        <p className="text-lg text-muted-foreground">AI-guided skin typing with pro pigment guidance</p>
      </div>

      <Card className="p-6 backdrop-blur-sm bg-white/80 border-lavender/20 rounded-2xl shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {fitzpatrickTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                selectedType === type.id
                  ? "border-lavender bg-lavender/10 shadow-lg"
                  : "border-gray-200 hover:border-lavender/50"
              }`}
              aria-label={`Select ${type.name}: ${type.description}`}
            >
              <img
                src={type.image || "/placeholder.svg"}
                alt={`${type.name} skin type example`}
                className="w-full h-24 object-cover rounded-lg mb-3"
              />
              <div className="text-center">
                <div className="font-semibold text-lavender-600">{type.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6 backdrop-blur-sm bg-white/80 border-lavender/20 rounded-2xl shadow-lg space-y-6">
        {/* Tone Slider */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Skin Tone</Label>
          <div className="space-y-2">
            <Slider value={tone} onValueChange={setTone} max={100} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Light</span>
              <span className="font-medium">Value: {tone[0]}</span>
              <span>Deep</span>
            </div>
          </div>
        </div>

        {/* Undertone Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Undertone</Label>
          <div className="flex gap-2">
            {["cool", "neutral", "warm"].map((option) => (
              <button
                key={option}
                onClick={() => setUndertone(option)}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                  undertone === option
                    ? "border-lavender bg-lavender text-white"
                    : "border-gray-200 hover:border-lavender/50"
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Sun Response */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sun Response</Label>
          <RadioGroup value={sunResponse} onValueChange={setSunResponse} className="flex gap-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="burns" id="burns" />
              <Label htmlFor="burns" className="flex items-center gap-1">
                <Sun className="w-4 h-4 text-red-500" />
                Burns easily
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sometimes" id="sometimes" />
              <Label htmlFor="sometimes" className="flex items-center gap-1">
                <Sun className="w-4 h-4 text-orange-500" />
                Sometimes burns
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rarely" id="rarely" />
              <Label htmlFor="rarely" className="flex items-center gap-1">
                <Sun className="w-4 h-4 text-yellow-500" />
                Rarely burns
              </Label>
            </div>
          </RadioGroup>
        </div>
      </Card>

      <div className="text-center">
        <Button
          onClick={handleAnalyze}
          disabled={!selectedType || isAnalyzing}
          className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white px-8 py-3 rounded-xl text-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-spin" />
              Analyzing with AI...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Analyze with AI
            </div>
          )}
        </Button>
      </div>

      {result && (
        <Card className="p-6 backdrop-blur-sm bg-white/90 border-lavender/20 rounded-2xl shadow-xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="space-y-6">
            {/* Result Badge */}
            <div className="flex items-center justify-between">
              <Badge className="bg-lavender text-white px-3 py-1 text-sm">
                Type {result.type} • {result.confidence}% confidence
              </Badge>
              <ToneSphere tone={tone[0]} undertone={undertone} />
            </div>

            {/* Pigment Swatches */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lavender-600">Recommended Pigments</h3>
              <div className="flex gap-3">
                {result.pigments.map((pigment, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: pigment.hex }}
                    />
                    <div className="text-sm">
                      <div className="font-medium">{pigment.name}</div>
                      <div className="text-xs text-muted-foreground">{pigment.code}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technique Callouts */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-lavender-600">Needle & Hand Speed</h4>
                <p className="text-sm text-muted-foreground">{result.techniques.needleSpeed}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-lavender-600">Depth Notes</h4>
                <p className="text-sm text-muted-foreground">{result.techniques.depth}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-lavender-600">Pre-/Post-Care Flags</h4>
                <p className="text-sm text-muted-foreground">{result.techniques.care}</p>
              </div>
            </div>

            {/* Reasoning */}
            <div className="bg-lavender/5 rounded-lg p-4">
              <h4 className="font-medium text-sm text-lavender-600 mb-2">Why we chose this</h4>
              <p className="text-sm text-muted-foreground">{result.reasoning}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => onExport(result)}
                variant="outline"
                className="flex items-center gap-2 border-lavender/30 hover:bg-lavender/5"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button
                onClick={() => onSave(result)}
                variant="outline"
                className="flex items-center gap-2 border-lavender/30 hover:bg-lavender/5"
              >
                <Save className="w-4 h-4" />
                Save to Client
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="text-center text-xs text-muted-foreground">
        For professional use only. Not a medical diagnosis.
      </div>
    </div>
  )
}

function ToneSphere({ tone, undertone }: { tone: number; undertone: string }) {
  const getPosition = () => {
    const angle = undertone === "cool" ? -60 : undertone === "warm" ? 60 : 0
    const radius = (tone / 100) * 30
    const x = 40 + Math.cos((angle * Math.PI) / 180) * radius
    const y = 40 + Math.sin((angle * Math.PI) / 180) * radius
    return { x, y }
  }

  const position = getPosition()

  return (
    <div className="relative w-20 h-20">
      <svg width="80" height="80" className="absolute inset-0">
        <circle cx="40" cy="40" r="35" fill="none" stroke="#e5e7eb" strokeWidth="2" />
        <circle cx={position.x} cy={position.y} r="4" fill="#b19cd9" className="animate-in zoom-in duration-500" />
      </svg>
    </div>
  )
}
