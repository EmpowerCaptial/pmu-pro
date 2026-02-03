"use client"

import { useState, useEffect, useRef } from 'react'
import { Clock, Play, Pause, Square, MapPin, Timer, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDemoAuth } from '@/hooks/use-demo-auth'

interface TimeTrackingSession {
  id: string
  clockInTime: string
  clockOutTime?: string
  totalHours?: number
  location?: string
  lat?: number
  lng?: number
  notes?: string
  breakSessions: BreakSession[]
}

interface BreakSession {
  id: string
  startTime: string
  endTime?: string
  duration?: number
  reason?: string
}

export function DatabaseTimeClock() {
  const { currentUser } = useDemoAuth()
  const [currentSession, setCurrentSession] = useState<TimeTrackingSession | null>(null)
  const [currentBreak, setCurrentBreak] = useState<BreakSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<string>('')
  const [locationStatus, setLocationStatus] = useState<{
    withinRange: boolean
    distance?: number
    lastChecked?: string
    autoClockOut?: boolean
  }>({ withinRange: true })
  
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentLocationRef = useRef<{lat: number, lng: number} | null>(null)

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          currentLocationRef.current = coords
          setLocation(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`)
        },
        () => {
          setLocation('Location not available')
        }
      )
    }
  }, [])

  // Check location and auto-clock-out if needed
  const checkLocationAndAutoClockOut = async () => {
    if (!currentLocationRef.current || !currentUser || currentUser.role !== 'student') {
      return
    }

    try {
      const response = await fetch('/api/time-tracking/check-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email || ''
        },
        body: JSON.stringify({
          lat: currentLocationRef.current.lat,
          lng: currentLocationRef.current.lng
        })
      })

      if (response.ok) {
        const data = await response.json()
        setLocationStatus({
          withinRange: data.withinRange,
          distance: data.distance,
          lastChecked: new Date().toLocaleTimeString(),
          autoClockOut: data.autoClockOut
        })

        // If auto-clock-out occurred, reload the session
        if (data.autoClockOut) {
          await loadCurrentSession()
          setError(`⚠️ Automatically clocked out - you were ${data.distance?.toFixed(1)}m away from the studio`)
        }
      }
    } catch (error) {
      console.error('Error checking location:', error)
    }
  }

  // Start/stop geolocation monitoring
  useEffect(() => {
    // Only monitor for students who are clocked in
    if (currentUser?.role === 'student' && currentSession && !currentSession.clockOutTime) {
      // Start monitoring every 15 minutes (900,000 ms)
      monitoringIntervalRef.current = setInterval(() => {
        checkLocationAndAutoClockOut()
      }, 15 * 60 * 1000)

      // Also check immediately when component mounts
      checkLocationAndAutoClockOut()

      return () => {
        if (monitoringIntervalRef.current) {
          clearInterval(monitoringIntervalRef.current)
        }
      }
    } else {
      // Clear monitoring if not a student or not clocked in
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current)
        monitoringIntervalRef.current = null
      }
    }
  }, [currentUser, currentSession])

  // Load current session on mount
  useEffect(() => {
    loadCurrentSession()
  }, [])

  const loadCurrentSession = async () => {
    try {
      const response = await fetch('/api/time-tracking', {
        headers: {
          'x-user-email': currentUser?.email || ''
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Find active session (no clock out time)
        const activeSession = data.sessions?.find((session: TimeTrackingSession) => !session.clockOutTime)
        setCurrentSession(activeSession || null)

        if (activeSession) {
          // Find active break
          const activeBreak = activeSession.breakSessions?.find((breakSession: BreakSession) => !breakSession.endTime)
          setCurrentBreak(activeBreak || null)
        }
      }
    } catch (error) {
      console.error('Error loading current session:', error)
    }
  }

  const handleAction = async (action: string, additionalData: any = {}) => {
    setLoading(true)
    setError(null)

    try {
      const body = {
        action,
        location,
        ...additionalData
      }

      // Get location for clock in
      if (action === 'clockIn' && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000
            })
          })
          body.lat = position.coords.latitude
          body.lng = position.coords.longitude
        } catch (geoError) {
          console.log('Geolocation not available:', geoError)
        }
      }

      const response = await fetch('/api/time-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        await loadCurrentSession()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Action failed')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return `${wholeHours}h ${minutes}m`
  }

  const getCurrentWorkTime = () => {
    if (!currentSession || currentSession.clockOutTime) return 0
    
    const now = new Date()
    const clockInTime = new Date(currentSession.clockInTime)
    const totalMs = now.getTime() - clockInTime.getTime()
    
    // Subtract break time
    const breakMs = currentSession.breakSessions.reduce((sum, breakSession) => {
      if (breakSession.endTime) {
        return sum + (new Date(breakSession.endTime).getTime() - new Date(breakSession.startTime).getTime())
      } else if (breakSession === currentBreak) {
        return sum + (now.getTime() - new Date(breakSession.startTime).getTime())
      }
      return sum
    }, 0)
    
    return Math.max(0, (totalMs - breakMs) / (1000 * 60 * 60)) // Convert to hours
  }

  const isClockedIn = !!currentSession && !currentSession.clockOutTime
  const isOnBreak = !!currentBreak && !currentBreak.endTime
  const currentWorkTime = getCurrentWorkTime()

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lavender">
            <Clock className="h-5 w-5" />
            <span>Time Clock</span>
          </CardTitle>
          <CardDescription>
            Track your work hours and breaks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Location Monitoring Status for Students */}
          {currentUser?.role === 'student' && isClockedIn && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Location Monitoring Active</span>
              </div>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• Checking your location every 15 minutes</p>
                <p>• You'll be automatically clocked out if you leave the studio area</p>
                {locationStatus.lastChecked && (
                  <p>• Last checked: {locationStatus.lastChecked}</p>
                )}
                {locationStatus.distance !== undefined && (
                  <div className="flex items-center space-x-2">
                    <span>Distance from studio:</span>
                    <Badge variant={locationStatus.withinRange ? "default" : "destructive"}>
                      {locationStatus.distance.toFixed(1)}m {locationStatus.withinRange ? '(Within range)' : '(Outside range)'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="flex items-center space-x-2">
                {isClockedIn ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Clocked In
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    Clocked Out
                  </Badge>
                )}
                {isOnBreak && (
                  <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                    On Break
                  </Badge>
                )}
              </div>
            </div>
            
            {isClockedIn && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Current Session</div>
                <div className="text-lg font-semibold text-lavender">
                  {formatDuration(currentWorkTime)}
                </div>
              </div>
            )}
          </div>

          {currentSession && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Clock In</div>
                <div className="font-medium">{formatTime(currentSession.clockInTime)}</div>
              </div>
              {currentSession.clockOutTime && (
                <div>
                  <div className="text-gray-600">Clock Out</div>
                  <div className="font-medium">{formatTime(currentSession.clockOutTime)}</div>
                </div>
              )}
              {currentSession.location && (
                <div className="col-span-2">
                  <div className="text-gray-600">Location</div>
                  <div className="font-medium flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{currentSession.location}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {!isClockedIn ? (
              <Button
                onClick={() => handleAction('clockIn')}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Clock In
              </Button>
            ) : (
              <>
                {!isOnBreak ? (
                  <>
                    <Button
                      onClick={() => handleAction('startBreak', { reason: 'Break' })}
                      disabled={loading}
                      variant="outline"
                      className="flex-1"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Start Break
                    </Button>
                    <Button
                      onClick={() => handleAction('clockOut')}
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Clock Out
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleAction('endBreak')}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    End Break
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <span>Recent Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            Time tracking data is now stored in the database and will be used for student hours calculation.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
