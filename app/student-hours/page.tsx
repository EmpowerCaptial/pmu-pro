"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  Target, 
  CheckCircle,
  AlertTriangle,
  GraduationCap,
  Clock3,
  Timer,
  Users
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { useClockInOut } from '@/hooks/use-clock-in-out'
import { NavBar } from '@/components/ui/navbar'

interface ClockEntry {
  id: string
  date: string
  clockIn: string
  clockOut?: string
  totalHours: number
  status: 'active' | 'completed'
  location?: string
  notes?: string
}

export default function StudentHoursPage() {
  const { currentUser } = useDemoAuth()
  const { clockStatus, isStudent, clockIn, clockOut } = useClockInOut()
  const [clockEntries, setClockEntries] = useState<ClockEntry[]>([])
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [currentClockIn, setCurrentClockIn] = useState<string | null>(null)

  // Prepare user object for NavBar
  const user = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase(),
    avatar: currentUser.avatar
  } : {
    name: "PMU Student",
    email: "student@pmupro.com",
    initials: "PS",
  }

  // Load clock entries from localStorage and sync with clock status
  useEffect(() => {
    const savedEntries = localStorage.getItem('student-clock-entries')
    
    if (savedEntries) {
      setClockEntries(JSON.parse(savedEntries))
    }
    
    // Sync with clock status from hook
    setIsClockedIn(clockStatus.isClockedIn)
    setCurrentClockIn(clockStatus.clockInTime)
  }, [clockStatus])

  // Calculate total hours
  const totalHours = clockEntries.reduce((total, entry) => total + entry.totalHours, 0)
  
  // Get required hours from localStorage (settable by staff managers)
  const [requiredHours, setRequiredHours] = useState(1000) // Default to 1000 hours
  
  // Load required hours from localStorage on client side
  useEffect(() => {
    const saved = localStorage.getItem('apprenticeship-required-hours')
    if (saved) {
      setRequiredHours(parseInt(saved))
    }
  }, [])
  
  const remainingHours = Math.max(0, requiredHours - totalHours)
  const progressPercentage = Math.min(100, (totalHours / requiredHours) * 100)

  // Get recent entries (last 7 days)
  const recentEntries = clockEntries
    .filter(entry => {
      const entryDate = new Date(entry.date + 'T00:00:00') // Treat as local date
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return entryDate >= sevenDaysAgo
    })
    .sort((a, b) => new Date(b.date + 'T00:00:00').getTime() - new Date(a.date + 'T00:00:00').getTime())

  const handleClockIn = async () => {
    const result = await clockIn()
    if (result.success) {
      // Create new clock entry using local date
      const now = new Date()
      const localDate = now.getFullYear() + '-' + 
        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
        String(now.getDate()).padStart(2, '0')
      
      const newEntry: ClockEntry = {
        id: Date.now().toString(),
        date: localDate,
        clockIn: now.toTimeString().split(' ')[0].substring(0, 5),
        status: 'active',
        totalHours: 0
      }
      
      const updatedEntries = [...clockEntries, newEntry]
      setClockEntries(updatedEntries)
      localStorage.setItem('student-clock-entries', JSON.stringify(updatedEntries))
      
      alert(result.message)
    } else {
      alert(`Error: ${result.message}`)
    }
  }

  const handleClockOut = async () => {
    const result = await clockOut()
    if (result.success) {
      // Update the last entry (active one)
      const updatedEntries = clockEntries.map((entry, index) => {
        if (index === clockEntries.length - 1 && entry.status === 'active') {
          const now = new Date()
          return {
            ...entry,
            clockOut: now.toTimeString().split(' ')[0].substring(0, 5),
            totalHours: result.hoursWorked || 0,
            status: 'completed' as const
          }
        }
        return entry
      })
      
      setClockEntries(updatedEntries)
      localStorage.setItem('student-clock-entries', JSON.stringify(updatedEntries))
      
      alert(result.message)
    } else {
      alert(`Error: ${result.message}`)
    }
  }

  const formatDate = (dateString: string) => {
    // Parse as local date to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month is 0-indexed
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Function to update required hours (for staff managers)
  const updateRequiredHours = (newHours: number) => {
    setRequiredHours(newHours)
    localStorage.setItem('apprenticeship-required-hours', newHours.toString())
  }

  // Access control - students, apprentices, and staff managers can access this page
  const isStaffManager = currentUser?.role === 'manager' || currentUser?.role === 'director' || currentUser?.role === 'owner'
  const canAccess = isStudent || isStaffManager
  
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
        <NavBar currentPath="/student-hours" user={user} />
        <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
          <div className="text-center py-16">
            <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
            <p className="text-gray-600 mb-4">
              Clock hours tracking is only available to students, apprentices, and staff managers.
            </p>
            <p className="text-sm text-gray-500">
              Your current role: <span className="font-medium">{currentUser?.role || 'Unknown'}</span>
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/student-hours" user={user} />
      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Apprenticeship Hours Tracker</h1>
              <p className="text-gray-600">Track your required apprenticeship hours</p>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Remaining</p>
                  <p className="text-2xl font-bold text-gray-900">{remainingHours.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{progressPercentage.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <span>Apprenticeship Requirements</span>
                </CardTitle>
                <CardDescription>
                  {requiredHours} hours required for apprenticeship completion
                </CardDescription>
              </div>
              {isStaffManager && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={requiredHours}
                    onChange={(e) => updateRequiredHours(parseInt(e.target.value) || 1000)}
                    className="w-24 text-center"
                    min="100"
                    max="2000"
                  />
                  <span className="text-sm text-gray-600">hours</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progress: {totalHours.toFixed(1)} / {requiredHours} hours</span>
                <span>{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              {isStaffManager && (
                <p className="text-xs text-gray-500">
                  💡 Staff managers can adjust the required hours using the input above
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Staff Manager View - All Students */}
        {isStaffManager && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>All Students Hours</span>
              </CardTitle>
              <CardDescription>
                Overview of all students' apprenticeship progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Mock student data - in real app, this would come from API */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Tierra Student</h4>
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        Student
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Hours:</span>
                        <span className="font-medium">{totalHours.toFixed(1)} / {requiredHours}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Sample Student 2</h4>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Apprentice
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Hours:</span>
                        <span className="font-medium">750.0 / {requiredHours}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span className="font-medium">75.0%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Sample Student 3</h4>
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Student
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Hours:</span>
                        <span className="font-medium">250.0 / {requiredHours}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span className="font-medium">25.0%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: '25%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Staff Manager Controls:</strong> Use the input field above to adjust the required hours for all students. 
                    Changes will be saved and applied to all apprenticeship tracking.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clock In/Out */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-green-600" />
              <span>Clock In/Out</span>
            </CardTitle>
            <CardDescription>
              Track your daily hours at the studio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {!isClockedIn ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Clock3 className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Clock In</h3>
                    <p className="text-gray-600 mb-4">Click below when you start your shift</p>
                    <Button 
                      onClick={handleClockIn}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                      size="lg"
                    >
                      <Clock className="h-5 w-5 mr-2" />
                      Clock In
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <Clock3 className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Currently Clocked In</h3>
                    <p className="text-gray-600 mb-4">
                      Since: {currentClockIn ? formatTime(new Date(currentClockIn).toLocaleTimeString('en-US', { hour12: false }).substring(0, 5)) : 'Unknown'}
                    </p>
                    <Button 
                      onClick={handleClockOut}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
                      size="lg"
                    >
                      <Clock className="h-5 w-5 mr-2" />
                      Clock Out
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Recent Clock Entries</span>
            </CardTitle>
            <CardDescription>
              Your last 7 days of clock entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentEntries.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent entries</h3>
                <p className="text-gray-600">Start clocking in to track your hours</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{formatDate(entry.date)}</h4>
                        <p className="text-sm text-gray-600">
                          {formatTime(entry.clockIn)} - {entry.clockOut ? formatTime(entry.clockOut) : 'In Progress'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {entry.status === 'active' && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Active
                        </Badge>
                      )}
                      {entry.status === 'completed' && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Completed
                        </Badge>
                      )}
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{entry.totalHours.toFixed(1)}h</p>
                        <p className="text-xs text-gray-500">hours</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
