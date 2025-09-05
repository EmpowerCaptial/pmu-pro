"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Phone,
  Mail
} from 'lucide-react'

interface Appointment {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  service: string
  date: string
  time: string
  duration: number
  price: number
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah@email.com',
    clientPhone: '(555) 123-4567',
    service: 'Eyebrow Microblading',
    date: '2024-01-15',
    time: '10:00',
    duration: 120,
    price: 350,
    status: 'scheduled',
    notes: 'First time client'
  },
  {
    id: '2',
    clientName: 'Emily Davis',
    clientEmail: 'emily@email.com',
    clientPhone: '(555) 987-6543',
    service: 'Lip Blush',
    date: '2024-01-15',
    time: '14:00',
    duration: 90,
    price: 400,
    status: 'scheduled'
  },
  {
    id: '3',
    clientName: 'Jessica Brown',
    clientEmail: 'jessica@email.com',
    clientPhone: '(555) 456-7890',
    service: 'Eyeliner',
    date: '2024-01-16',
    time: '11:00',
    duration: 60,
    price: 300,
    status: 'completed'
  }
]

export default function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(apt => apt.date === date)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleDateClick = (day: number) => {
    const dateString = formatDateString(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
    setSelectedDate(dateString)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const days = getDaysInMonth(currentDate)
  const selectedAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-ink mb-2">Booking Calendar</h1>
            <p className="text-muted">Manage your appointments and schedule</p>
          </div>
          <Button className="bg-lavender hover:bg-lavender-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {formatDate(currentDate)}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (day === null) {
                      return <div key={index} className="p-2"></div>
                    }
                    
                    const dateString = formatDateString(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
                    const dayAppointments = getAppointmentsForDate(dateString)
                    const isSelected = selectedDate === dateString
                    const isToday = dateString === formatDateString(new Date())
                    
                    return (
                      <div
                        key={day}
                        className={`p-2 min-h-[60px] border rounded cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-lavender text-white' 
                            : isToday 
                              ? 'bg-lavender/20 border-lavender' 
                              : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleDateClick(day)}
                      >
                        <div className="text-sm font-medium mb-1">{day}</div>
                        {dayAppointments.length > 0 && (
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 2).map(apt => (
                              <div
                                key={apt.id}
                                className="text-xs bg-white/80 text-gray-800 px-1 py-0.5 rounded truncate"
                              >
                                {apt.time} - {apt.clientName.split(' ')[0]}
                              </div>
                            ))}
                            {dayAppointments.length > 2 && (
                              <div className="text-xs text-gray-600">
                                +{dayAppointments.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate 
                    ? `Appointments - ${new Date(selectedDate).toLocaleDateString()}`
                    : 'Select a date to view appointments'
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  selectedAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {selectedAppointments.map(appointment => (
                        <div key={appointment.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{appointment.clientName}</h4>
                              <p className="text-sm text-gray-600">{appointment.service}</p>
                            </div>
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span>{appointment.time} ({appointment.duration} min)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span>{appointment.clientPhone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span>{appointment.clientEmail}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-green-600">${appointment.price}</span>
                            </div>
                          </div>
                          
                          {appointment.notes && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm text-gray-600">{appointment.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No appointments scheduled</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Click on a date to view appointments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}