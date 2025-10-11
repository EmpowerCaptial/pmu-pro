"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Crown, ArrowRight, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UpgradePromptProps {
  isOpen: boolean
  onClose: () => void
  currentPlan: string
  upgradeMessage: string
  planComparison?: {
    current: { name: string; clients: number | string; price: number }
    upgrade: { name: string; clients: number | string; price: number }
    benefits: string[]
  }
  currentClientCount: number
  maxAllowed: number
}

export function UpgradePrompt({
  isOpen,
  onClose,
  currentPlan,
  upgradeMessage,
  planComparison,
  currentClientCount,
  maxAllowed
}: UpgradePromptProps) {
  const router = useRouter()
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async () => {
    if (!planComparison) return
    
    setIsUpgrading(true)
    try {
      // Navigate to pricing page with pre-selected plan
      router.push(`/pricing?plan=${planComparison.upgrade.name.toLowerCase()}`)
    } catch (error) {
      console.error('Error navigating to upgrade:', error)
    } finally {
      setIsUpgrading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Crown className="h-4 w-4 text-amber-600" />
              </div>
              <CardTitle className="text-lg">Upgrade Required</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            {upgradeMessage}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Usage */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Usage:</span>
              <Badge variant="outline" className="text-red-600 border-red-600">
                {currentClientCount}/{maxAllowed} clients
              </Badge>
            </div>
          </div>

          {/* Plan Comparison */}
          {planComparison && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Current Plan */}
                <div className="text-center p-3 border border-gray-200 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">{planComparison.current.name}</div>
                  <div className="text-lg font-bold text-gray-900">${planComparison.current.price}</div>
                  <div className="text-xs text-gray-500">{planComparison.current.clients} clients</div>
                </div>

                {/* Upgrade Plan */}
                <div className="text-center p-3 border-2 border-violet-500 rounded-lg bg-violet-50">
                  <div className="text-sm font-medium text-violet-700">{planComparison.upgrade.name}</div>
                  <div className="text-lg font-bold text-violet-900">${planComparison.upgrade.price}</div>
                  <div className="text-xs text-violet-600">{planComparison.upgrade.clients} clients</div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900">What you'll get:</div>
                {planComparison.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={isUpgrading || !planComparison}
              className="flex-1 bg-violet-600 hover:bg-violet-700"
            >
              {isUpgrading ? (
                'Processing...'
              ) : (
                <>
                  Upgrade Now
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-gray-500 text-center pt-2">
            Upgrade instantly and unlock more features for your growing business
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
