"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Home } from "lucide-react"
import Link from "next/link"
import { pigmentLibrary, type PigmentData } from "@/lib/pigment-data"
import { searchPigments, getPigmentsByCategory } from "@/lib/pigment-matching"

export default function PigmentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPigment, setSelectedPigment] = useState<PigmentData | null>(null)

  const filteredPigments = searchQuery ? searchPigments(searchQuery) : pigmentLibrary

  const browPigments = getPigmentsByCategory("Brows")
  const lipPigments = getPigmentsByCategory("Lips")
  const eyelinerPigments = getPigmentsByCategory("Eyeliner")
  const correctionPigments = getPigmentsByCategory("Correction")

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-ivory)" }}>
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0" style={{ opacity: 0.05 }}>
        <img src="/images/pmu-guide-logo-transparent.png" alt="PMU Guide" className="w-3/5 max-w-2xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div
          className="border-b"
          style={{ backgroundColor: "var(--color-lavender)", borderColor: "var(--color-beige)" }}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-white">Professional Pigment Library</h1>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-white" />
                <Input
                  placeholder="Search pigments, brands, or colors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" style={{ backgroundColor: "var(--color-beige)" }}>
              <TabsTrigger value="all">All Pigments</TabsTrigger>
              <TabsTrigger value="brows">Brows</TabsTrigger>
              <TabsTrigger value="lips">Lips</TabsTrigger>
              <TabsTrigger value="eyeliner">Eyeliner</TabsTrigger>
              <TabsTrigger value="correction">Correction</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <PigmentGrid pigments={filteredPigments} onSelect={setSelectedPigment} />
            </TabsContent>
            <TabsContent value="brows">
              <PigmentGrid pigments={browPigments} onSelect={setSelectedPigment} />
            </TabsContent>
            <TabsContent value="lips">
              <PigmentGrid pigments={lipPigments} onSelect={setSelectedPigment} />
            </TabsContent>
            <TabsContent value="eyeliner">
              <PigmentGrid pigments={eyelinerPigments} onSelect={setSelectedPigment} />
            </TabsContent>
            <TabsContent value="correction">
              <PigmentGrid pigments={correctionPigments} onSelect={setSelectedPigment} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedPigment && <PigmentDetailModal pigment={selectedPigment} onClose={() => setSelectedPigment(null)} />}
    </div>
  )
}

function PigmentGrid({ pigments, onSelect }: { pigments: PigmentData[]; onSelect: (pigment: PigmentData) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pigments.map((pigment, index) => (
        <Card
          key={index}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSelect(pigment)}
          style={{ backgroundColor: "white", borderColor: "var(--color-beige)" }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{pigment.pigmentName}</CardTitle>
              <Badge style={{ backgroundColor: "var(--color-lavender)", color: "white" }}>{pigment.brand}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <img
                src={pigment.digitalSwatch || "/placeholder.svg"}
                alt={`${pigment.pigmentName} swatch`}
                className="w-12 h-12 rounded-full border-2"
                style={{ borderColor: "var(--color-beige)" }}
              />
              <div>
                <p className="text-sm font-medium">{pigment.colorCategory}</p>
                <p className="text-xs text-gray-600">{pigment.baseTone} Base</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-3">{pigment.undertoneDescription}</p>
            <div className="flex flex-wrap gap-1">
              {pigment.skinCompatibility.recommendedFitzpatrick.map((type) => (
                <Badge key={type} variant="outline" className="text-xs">
                  Fitzpatrick {type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PigmentDetailModal({ pigment, onClose }: { pigment: PigmentData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "var(--color-ivory)", borderColor: "var(--color-beige)" }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{pigment.pigmentName}</CardTitle>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <img
              src={pigment.digitalSwatch || "/placeholder.svg"}
              alt={`${pigment.pigmentName} swatch`}
              className="w-16 h-16 rounded-full border-2"
              style={{ borderColor: "var(--color-beige)" }}
            />
            <img
              src={pigment.healedResultPhoto || "/placeholder.svg"}
              alt={`${pigment.pigmentName} healed result`}
              className="w-32 h-24 rounded border-2 object-cover"
              style={{ borderColor: "var(--color-beige)" }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Basic Information</h4>
              <p>
                <strong>Brand:</strong> {pigment.brand}
              </p>
              <p>
                <strong>Category:</strong> {pigment.colorCategory}
              </p>
              <p>
                <strong>Base Tone:</strong> {pigment.baseTone}
              </p>
              <p>
                <strong>Opacity:</strong> {pigment.opacityLevel}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Skin Compatibility</h4>
              <p>
                <strong>Best For:</strong> {pigment.skinCompatibility.bestFor.join(", ")}
              </p>
              <p>
                <strong>Fitzpatrick:</strong> {pigment.skinCompatibility.recommendedFitzpatrick.join(", ")}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Undertone & Healing</h4>
            <p>{pigment.undertoneDescription}</p>
            <p className="text-sm text-gray-600 mt-1">{pigment.temperatureShift}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Needle Recommendations</h4>
            <p>
              <strong>Configurations:</strong> {pigment.needleRecommendations.suggestedConfigurations.join(", ")}
            </p>
            <p>
              <strong>Dilution:</strong> {pigment.needleRecommendations.dilutionRatios}
            </p>
          </div>

          {pigment.correctorModifierPairings.suggestedModifiers.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Modifiers & Mixing</h4>
              <p>
                <strong>Suggested Modifiers:</strong> {pigment.correctorModifierPairings.suggestedModifiers.join(", ")}
              </p>
              <p className="text-sm">{pigment.correctorModifierPairings.mixingNotes}</p>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-2">Storage & Safety</h4>
            <p>
              <strong>Shelf Life:</strong> {pigment.shelfLife}
            </p>
            <p>
              <strong>Storage:</strong> {pigment.storageConditions}
            </p>
            <p className="text-sm text-amber-600">{pigment.patchTestNotes}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
