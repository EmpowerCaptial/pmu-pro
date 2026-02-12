'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  ClipboardList, 
  CheckCircle, 
  XCircle,
  Download,
  Printer,
  Calendar,
  Users,
  MapPin,
  Search
} from 'lucide-react'
import { NavBar } from '@/components/ui/navbar'
import { useDemoAuth } from '@/hooks/use-demo-auth'

interface Location {
  id: string
  name: string
}

interface Student {
  id: string
  name: string
  email: string
  locationId: string | null
  location: Location | null
}

interface AttendanceRecord {
  id: string
  studentId: string
  date: string
  status: 'present' | 'absent'
  notes?: string
  student: {
    id: string
    name: string
    email: string
  }
}

export default function AttendancePage() {
  const { currentUser, isLoading } = useDemoAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Check if user has permission to access attendance
  const hasAttendanceAccess = currentUser && 
    (currentUser.role === 'owner' || 
     currentUser.role === 'manager' || 
     currentUser.role === 'director' ||
     currentUser.role === 'instructor')

  useEffect(() => {
    if (currentUser && !isLoading && hasAttendanceAccess) {
      loadLocations()
    }
  }, [currentUser, isLoading, hasAttendanceAccess])

  useEffect(() => {
    if (currentUser && !isLoading && hasAttendanceAccess && selectedLocationId) {
      loadStudents()
      loadAttendance()
    }
  }, [currentUser, isLoading, hasAttendanceAccess, selectedLocationId, selectedDate])

  const loadLocations = async () => {
    if (!currentUser?.email) return
    try {
      const response = await fetch('/api/locations', {
        headers: {
          'x-user-email': currentUser.email
        }
      })
      if (response.ok) {
        const data = await response.json()
        const activeLocations = (data.data || []).filter((loc: Location) => loc.isActive)
        setLocations(activeLocations)
        
        // Auto-select first location if user doesn't have all-location access
        if (activeLocations.length > 0 && !selectedLocationId) {
          // Check if instructor has all-location access
          const userResponse = await fetch('/api/profile', {
            headers: {
              'x-user-email': currentUser.email
            }
          })
          if (userResponse.ok) {
            const userData = await userResponse.json()
            if (userData.user?.hasAllLocationAccess) {
              // User can see all locations, don't auto-select
            } else if (userData.user?.locationId) {
              setSelectedLocationId(userData.user.locationId)
            } else {
              setSelectedLocationId(activeLocations[0].id)
            }
          } else {
            setSelectedLocationId(activeLocations[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Error loading locations:', error)
    }
  }

  const loadStudents = async () => {
    if (!currentUser?.email || !selectedLocationId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/attendance/students?locationId=${selectedLocationId}`, {
        headers: {
          'x-user-email': currentUser.email
        }
      })
      if (response.ok) {
        const data = await response.json()
        setStudents(data.data || [])
      }
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAttendance = async () => {
    if (!currentUser?.email || !selectedLocationId || !selectedDate) return
    try {
      const response = await fetch(`/api/attendance?locationId=${selectedLocationId}&date=${selectedDate}`, {
        headers: {
          'x-user-email': currentUser.email
        }
      })
      if (response.ok) {
        const data = await response.json()
        const attendanceMap: Record<string, AttendanceRecord> = {}
        data.data.forEach((record: AttendanceRecord) => {
          attendanceMap[record.studentId] = record
        })
        setAttendance(attendanceMap)
      }
    } catch (error) {
      console.error('Error loading attendance:', error)
    }
  }

  const markAttendance = async (studentId: string, status: 'present' | 'absent') => {
    if (!currentUser?.email || !selectedLocationId || !selectedDate) return

    setSaving(true)
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          studentId,
          locationId: selectedLocationId,
          date: selectedDate,
          status
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAttendance(prev => ({
          ...prev,
          [studentId]: data.data
        }))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to mark attendance')
      }
    } catch (error) {
      console.error('Error marking attendance:', error)
      alert('Failed to mark attendance')
    } finally {
      setSaving(false)
    }
  }

  const exportAttendance = async (format: 'csv' | 'print' = 'csv') => {
    if (!currentUser?.email || !selectedLocationId || !selectedDate) return

    try {
      if (format === 'csv') {
        const response = await fetch(`/api/attendance/export?locationId=${selectedLocationId}&date=${selectedDate}&format=csv`, {
          headers: {
            'x-user-email': currentUser.email
          }
        })
        
        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `attendance-${selectedDate}.csv`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else {
          alert('Failed to export attendance')
        }
      } else {
        // Print functionality
        window.print()
      }
    } catch (error) {
      console.error('Error exporting attendance:', error)
      alert('Failed to export attendance')
    }
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const presentCount = Object.values(attendance).filter(a => a.status === 'present').length
  const absentCount = Object.values(attendance).filter(a => a.status === 'absent').length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-white to-purple/10">
        <NavBar user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          avatar: (currentUser as any).avatar
        } : undefined} />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hasAttendanceAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-white to-purple/10">
        <NavBar user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          avatar: (currentUser as any).avatar
        } : undefined} />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
              <p className="text-gray-600 mb-4">
                Attendance management is only available to instructors, directors, and owners.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-white to-purple/10 pb-20 sm:pb-0">
      <NavBar currentPath="/attendance" user={currentUser || undefined} />
      
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-16 sm:pb-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 sm:mb-6 gap-4 lg:gap-0">
          <div className="w-full lg:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1 sm:mb-2 flex items-center gap-2">
              <ClipboardList className="h-6 w-6 sm:h-8 sm:w-8" />
              Student Attendance
            </h1>
            <p className="text-muted text-sm sm:text-base">Mark students as present or absent for the day</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
            <Button 
              variant="outline" 
              onClick={() => exportAttendance('csv')}
              className="border-lavender text-lavender hover:bg-lavender/5 text-xs sm:text-sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Download CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => exportAttendance('print')}
              className="border-lavender text-lavender hover:bg-lavender/5 text-xs sm:text-sm"
            >
              <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="location" className="text-sm font-medium mb-2 block">
              <MapPin className="h-4 w-4 inline mr-1" />
              Location
            </Label>
            <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date" className="text-sm font-medium mb-2 block">
              <Calendar className="h-4 w-4 inline mr-1" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10"
            />
          </div>

          <div>
            <Label htmlFor="search" className="text-sm font-medium mb-2 block">
              <Search className="h-4 w-4 inline mr-1" />
              Search Students
            </Label>
            <Input
              id="search"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted">Total Students</p>
                  <p className="text-lg sm:text-2xl font-bold">{filteredStudents.length}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-lavender" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted">Present</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">{presentCount}</p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted">Absent</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600">{absentCount}</p>
                </div>
                <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student List */}
        <Card>
          <CardHeader>
            <CardTitle>Students - {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender"></div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {selectedLocationId ? 'No students found for this location' : 'Please select a location'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredStudents.map((student) => {
                  const attendanceRecord = attendance[student.id]
                  const isPresent = attendanceRecord?.status === 'present'
                  const isAbsent = attendanceRecord?.status === 'absent'

                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm sm:text-base">{student.name}</p>
                        <p className="text-xs text-gray-600">{student.email}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isPresent && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Present
                          </Badge>
                        )}
                        {isAbsent && (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Absent
                          </Badge>
                        )}

                        <Button
                          size="sm"
                          variant={isPresent ? "default" : "outline"}
                          onClick={() => markAttendance(student.id, 'present')}
                          disabled={saving}
                          className={isPresent ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Present
                        </Button>

                        <Button
                          size="sm"
                          variant={isAbsent ? "default" : "outline"}
                          onClick={() => markAttendance(student.id, 'absent')}
                          disabled={saving}
                          className={isAbsent ? "bg-red-600 hover:bg-red-700" : ""}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Absent
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

