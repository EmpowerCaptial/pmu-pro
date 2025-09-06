"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Phone,
  Mail,
  Search,
  UserPlus
} from 'lucide-react'
import { getClients, Client } from '@/lib/client-storage'

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
  
  // New Appointment Modal States
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [clientSelectionType, setClientSelectionType] = useState<'new' | 'existing' | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [appointmentData, setAppointmentData] = useState({
    service: '',
    time: '',
    duration: 60,
    price: 0,
    notes: ''
  })

  // Load clients on component mount
  useEffect(() => {
    const loadedClients = getClients()
    setClients(loadedClients)
  }, [])

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
  )

  const handleNewAppointmentClick = () => {
    setShowNewAppointmentModal(true)
    setClientSelectionType(null)
    setSelectedClient(null)
    setClientSearchTerm('')
    setNewClientData({ name: '', email: '', phone: '' })
    setAppointmentData({ service: '', time: '', duration: 60, price: 0, notes: '' })
  }

  const handleClientSelection = (type: 'new' | 'existing') => {
    setClientSelectionType(type)
  }

  const handleCreateAppointment = () => {
    if (!selectedDate) {
      alert('Please select a date first')
      return
    }

    const client = clientSelectionType === 'existing' ? selectedClient : {
      id: Date.now().toString(),
      name: newClientData.name,
      email: newClientData.email,
      phone: newClientData.phone
    }

    if (!client || !client.name) {
      alert('Please select or enter client information')
      return
    }

    if (!appointmentData.service || !appointmentData.time) {
      alert('Please fill in service and time')
      return
    }

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      clientName: client.name,
      clientEmail: client.email || '',
      clientPhone: client.phone || '',
      service: appointmentData.service,
      date: selectedDate,
      time: appointmentData.time,
      duration: appointmentData.duration,
      price: appointmentData.price,
      status: 'scheduled',
      notes: appointmentData.notes
    }

    setAppointments([...appointments, newAppointment])
    setShowNewAppointmentModal(false)
    alert('Appointment created successfully!')
  }

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
          <Button 
            onClick={handleNewAppointmentClick}
            className="bg-lavender hover:bg-lavender-600 text-white"
          >
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

      {/* New Appointment Modal */}
      <Dialog open={showNewAppointmentModal} onOpenChange={setShowNewAppointmentModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-lavender/10 to-purple/10 p-6 -m-6 mb-6 border-b border-gray-200 rounded-t-lg">
            <DialogTitle className="flex items-center gap-2 text-gray-900 font-bold text-xl">
              <Calendar className="h-6 w-6 text-lavender" />
              New Appointment
            </DialogTitle>
            <DialogDescription className="text-gray-700 mt-3 text-base font-medium bg-white/80 p-3 rounded-lg border border-gray-200">
              Create a new appointment for {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'selected date'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Client Selection Type */}
            {!clientSelectionType && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Label className="text-lg font-semibold text-gray-900">Select Client Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleClientSelection('existing')}
                    className="h-20 bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <User className="h-6 w-6" />
                      <span className="font-semibold">Existing Client</span>
                    </div>
                  </Button>
                  <Button
                    onClick={() => handleClientSelection('new')}
                    className="h-20 bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <UserPlus className="h-6 w-6" />
                      <span className="font-semibold">New Client</span>
                    </div>
                  </Button>
                </div>
              </div>
            )}

            {/* Existing Client Selection */}
            {clientSelectionType === 'existing' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold text-gray-900">Select Existing Client</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setClientSelectionType(null)}
                    className="bg-white hover:bg-gray-50 border-gray-300"
                  >
                    Back
                  </Button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search clients..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-300 focus:border-lavender focus:ring-lavender/20"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 bg-white rounded-lg p-2 border border-gray-200">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedClient?.id === client.id
                            ? 'bg-lavender text-white border-lavender shadow-md'
                            : 'hover:bg-gray-50 border-gray-200 bg-white'
                        }`}
                      >
                        <div className="font-semibold">{client.name}</div>
                        <div className="text-sm opacity-75">
                          {client.email} • {client.phone}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
                      <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No clients found</p>
                      <p className="text-sm">Try adjusting your search or add a new client</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* New Client Form */}
            {clientSelectionType === 'new' && (
              <div className="space-y-4 p-6 bg-white rounded-lg border-2 border-gray-300 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-xl font-bold text-gray-900 bg-lavender/10 px-4 py-2 rounded-lg">New Client Information</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setClientSelectionType(null)}
                    className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium"
                  >
                    ← Back
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName" className="text-gray-800 font-semibold text-base">Client Name *</Label>
                    <Input
                      id="clientName"
                      value={newClientData.name}
                      onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                      placeholder="Enter client name"
                      className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail" className="text-gray-800 font-semibold text-base">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={newClientData.email}
                      onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                      placeholder="Enter email address"
                      className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="clientPhone" className="text-gray-800 font-semibold text-base">Phone</Label>
                    <Input
                      id="clientPhone"
                      value={newClientData.phone}
                      onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})}
                      placeholder="Enter phone number"
                      className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 text-base"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Appointment Details */}
            {(selectedClient || clientSelectionType === 'new') && (
              <div className="space-y-4 p-6 bg-white rounded-lg border-2 border-gray-300 shadow-lg">
                <Label className="text-xl font-bold text-gray-900 bg-lavender/10 px-4 py-2 rounded-lg">Appointment Details</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service" className="text-gray-800 font-semibold text-base">Service *</Label>
                    <Select value={appointmentData.service} onValueChange={(value) => setAppointmentData({...appointmentData, service: value})}>
                      <SelectTrigger className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 text-base">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="microblading">Microblading</SelectItem>
                        <SelectItem value="lip-blush">Lip Blush</SelectItem>
                        <SelectItem value="eyeliner">Eyeliner</SelectItem>
                        <SelectItem value="eyebrow-mapping">Eyebrow Mapping</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="touch-up">Touch-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-gray-800 font-semibold text-base">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={appointmentData.time}
                      onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
                      className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-gray-800 font-semibold text-base">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={appointmentData.duration}
                      onChange={(e) => setAppointmentData({...appointmentData, duration: parseInt(e.target.value) || 60})}
                      className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-gray-800 font-semibold text-base">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={appointmentData.price}
                      onChange={(e) => setAppointmentData({...appointmentData, price: parseFloat(e.target.value) || 0})}
                      className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 text-base"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-gray-800 font-semibold text-base">Notes</Label>
                  <Input
                    id="notes"
                    value={appointmentData.notes}
                    onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                    placeholder="Any additional notes..."
                    className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 text-base"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 bg-gray-50 p-4 -m-6 mt-6 rounded-b-lg">
              <Button
                variant="outline"
                onClick={() => setShowNewAppointmentModal(false)}
                className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAppointment}
                className="bg-lavender hover:bg-lavender-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={!selectedClient && clientSelectionType !== 'new'}
              >
                Create Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}