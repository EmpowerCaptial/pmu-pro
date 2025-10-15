"use client"

import { useState, useEffect } from 'react'
import { 
  Clock, 
  MapPin, 
  Play, 
  Pause, 
  Square,
  Users,
  Calendar,
  Timer
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NavBar } from '@/components/ui/navbar'
import { useDemoAuth } from '@/hooks/use-demo-auth'

export default function TimeClockPage() {
  const { currentUser } = useDemoAuth()
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [workTime, setWorkTime] = useState(0)
  const [location, setLocation] = useState('')
  const [clockHistory, setClockHistory] = useState([
    {
      id: 1,
      date: '2024-01-15',
      clockIn: '09:00 AM',
      clockOut: '05:30 PM',
      totalHours: '8.5',
      location: 'Main Studio'
    },
    {
      id: 2,
      date: '2024-01-14',
      clockIn: '09:15 AM',
      clockOut: '05:45 PM',
      totalHours: '8.5',
      location: 'Main Studio'
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      if (isClockedIn) {
        setWorkTime(prev => prev + 1)
      }
    }, 1000)

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`)
        },
        () => {
          setLocation('Location not available')
        }
      )
    }

    return () => clearInterval(timer)
  }, [isClockedIn])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleClockIn = () => {
    setIsClockedIn(true)
    setWorkTime(0)
  }

  const handleClockOut = () => {
    setIsClockedIn(false)
    // Add to history
    const newEntry = {
      id: clockHistory.length + 1,
      date: new Date().toISOString().split('T')[0],
      clockIn: '09:00 AM', // This would be the actual clock in time
      clockOut: new Date().toLocaleTimeString(),
      totalHours: (workTime / 3600).toFixed(1),
      location: location || 'Unknown'
    }
    setClockHistory([newEntry, ...clockHistory])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <NavBar currentUser={currentUser} />
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-ink mb-2">Time Clock</h1>
            <p className="text-muted">Track your work hours with GPS verification</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Current Time</p>
            <p className="text-lg font-semibold">{currentTime.toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Main Clock Card */}
        <Card className="border-gray-200 mb-8">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-lavender to-purple-600 rounded-full flex items-center justify-center">
                  <Clock className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isClockedIn ? 'Currently Working' : 'Ready to Clock In'}
                </h2>
                <p className="text-gray-600">
                  {isClockedIn ? `Work time: ${formatTime(workTime)}` : 'Click below to start your work day'}
                </p>
              </div>

              <div className="flex justify-center gap-4 mb-6">
                {!isClockedIn ? (
                  <Button 
                    size="lg" 
                    onClick={handleClockIn}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Clock In
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    variant="destructive"
                    onClick={handleClockOut}
                  >
                    <Square className="h-5 w-5 mr-2" />
                    Clock Out
                  </Button>
                )}
              </div>

              {/* Location Info */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{location || 'Getting location...'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Today's Hours</h3>
              <p className="text-2xl font-bold text-blue-600">{formatTime(workTime)}</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Timer className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">This Week</h3>
              <p className="text-2xl font-bold text-green-600">34.5h</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Team Status</h3>
              <p className="text-2xl font-bold text-purple-600">3 Online</p>
            </CardContent>
          </Card>
        </div>

        {/* Clock History */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Recent Clock History</CardTitle>
            <CardDescription>Your recent clock in/out records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clockHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Clock className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{entry.date}</h3>
                      <p className="text-sm text-gray-600">{entry.clockIn} - {entry.clockOut}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-green-200 text-green-800">
                      {entry.totalHours}h
                    </Badge>
                    <span className="text-sm text-gray-600">{entry.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
