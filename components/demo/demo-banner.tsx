"use client"

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, AlertTriangle, Info, X } from 'lucide-react'
import { 
  isDemoMode, 
  getRemainingDemoTime, 
  isDemoSessionExpired,
  setDemoMode 
} from '@/lib/demo-auth'

export default function DemoBanner() {
  const [remainingTime, setRemainingTime] = useState(0)
  const [isExpired, setIsExpired] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!isDemoMode()) return

    const updateTime = () => {
      const time = getRemainingDemoTime()
      const expired = isDemoSessionExpired()
      setRemainingTime(time)
      setIsExpired(expired)
    }

    updateTime()
    const interval = setInterval(updateTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  if (!isDemoMode() || !isVisible) return null

  const handleExitDemo = () => {
    setDemoMode(false)
    window.location.reload()
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (isExpired) {
    return (
      <Alert className="border-red-200 bg-red-50 mb-4">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="flex items-center justify-between">
            <span className="font-medium">Demo Session Expired</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExitDemo}
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              Exit Demo
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 mb-4">
      <Info className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                DEMO MODE
              </Badge>
              <span className="text-sm">All features available • Data will not be saved</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3 w-3" />
              <span>Session expires in: <strong>{formatTime(remainingTime)}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExitDemo}
              className="text-amber-700 border-amber-300 hover:bg-amber-100"
            >
              Exit Demo
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsVisible(false)}
              className="text-amber-600 hover:text-amber-800"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
