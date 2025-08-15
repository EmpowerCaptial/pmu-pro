"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Palette, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Pigment } from "@/lib/types"

interface PigmentCardProps {
  pigment: Pigment
  recommendation?: {
    why: string
    expectedHealShift?: string
  }
  isRecommended?: boolean
  onSelect?: () => void
  className?: string
}

export function PigmentCard({ pigment, recommendation, isRecommended, onSelect, className }: PigmentCardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-md", isRecommended && "ring-2 ring-primary", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {pigment.hexPreview && (
                <div
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: pigment.hexPreview }}
                />
              )}
              {pigment.name}
            </CardTitle>
            <CardDescription className="text-sm">{pigment.brand}</CardDescription>
          </div>
          {isRecommended && <Badge className="bg-primary text-primary-foreground">Recommended</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pigment Properties */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Base Tone:</span>
            <div className="font-medium capitalize">{pigment.baseTone}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Opacity:</span>
            <div className="font-medium capitalize">{pigment.opacity}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Ideal Fitzpatrick:</span>
            <div className="font-medium">{pigment.idealFitz}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Use Case:</span>
            <div className="font-medium capitalize">{pigment.useCase}</div>
          </div>
        </div>

        {/* Hue Notes */}
        <div className="text-sm">
          <span className="text-muted-foreground">Hue Notes:</span>
          <p className="text-foreground mt-1">{pigment.hueNotes}</p>
        </div>

        {/* Healing Shift */}
        {pigment.tempShift && (
          <div className="text-sm">
            <span className="text-muted-foreground">Expected Healing:</span>
            <p className="text-foreground mt-1">{pigment.tempShift}</p>
          </div>
        )}

        {/* AI Recommendation */}
        {recommendation && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4 text-primary" />
              Why This Pigment?
            </div>
            <p className="text-sm text-muted-foreground">{recommendation.why}</p>
            {recommendation.expectedHealShift && (
              <p className="text-xs text-muted-foreground">
                <strong>Healing prediction:</strong> {recommendation.expectedHealShift}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        {onSelect && (
          <Button onClick={onSelect} className="w-full gap-2">
            <Palette className="h-4 w-4" />
            Select This Pigment
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
