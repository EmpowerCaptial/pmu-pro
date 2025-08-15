"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RiskPill } from "@/components/ui/risk-pill"
import { cn } from "@/lib/utils"

interface ResultPanelProps {
  title: string
  description?: string
  result?: "safe" | "precaution" | "not_recommended"
  confidence?: number
  details: Array<{
    label: string
    value: string | React.ReactNode
  }>
  recommendations?: string[]
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary"
    icon?: React.ReactNode
  }>
  className?: string
}

export function ResultPanel({
  title,
  description,
  result,
  confidence,
  details,
  recommendations,
  actions,
  className,
}: ResultPanelProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {result && <RiskPill risk={result} />}
            {confidence && (
              <Badge variant="outline" className="text-xs">
                {Math.round(confidence * 100)}% confidence
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Details */}
        <div className="grid gap-3">
          {details.map((detail, index) => (
            <div key={index} className="flex justify-between items-start">
              <span className="text-sm font-medium text-muted-foreground">{detail.label}:</span>
              <div className="text-sm text-right max-w-xs">{detail.value}</div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recommendations:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={action.onClick}
                className="gap-2"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
