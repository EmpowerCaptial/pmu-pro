"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle,
  X,
  AlertTriangle,
  Plus,
  Trash2
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { NavBar } from '@/components/ui/navbar'

interface RoomBooking {
  id: string
  roomName: string
  bookingDate: string
  startTime: string
  endTime: string
  serviceType?: string
  clientName?: string
  notes?: string
  status: string
  user: {
    id: string
    name: string
    email: string
    role: string
    avatar?: string
  }
}

// Generate time slots from 9:00 AM to 6:00 PM in 1.25 hour increments
const generateTimeSlots = () => {
  const slots = []
  let currentHour = 9
  let currentMinute = 0
  
  while (currentHour < 18) {
    const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    
    // Add 1 hour and 15 minutes (75 minutes)
    currentMinute += 75
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60)
      currentMinute = currentMinute % 60
    }
    
    const endTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    
    slots.push({ startTime, endTime })
  }
  
  return slots
}

const TIME_SLOTS = generateTimeSlots()

export default function RoomBookingPage() {
  const { currentUser, isLoading } = useDemoAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedRoom, setSelectedRoom] = useState('Treatment Room 1')
  const [bookings, setBookings] = useState<RoomBooking[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingFormData, setBookingFormData] = useState({
    roomName: 'Treatment Room 1',
    startTime: '',
    endTime: '',
    serviceType: '',
    clientName: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Available rooms
  const availableRooms = ['Treatment Room 1', 'Treatment Room 2', 'Treatment Room 3']

  // Load bookings for the selected date
  useEffect(() => {
    const loadBookings = async () => {
      if (!currentUser?.email) return
      
      setIsLoadingBookings(true)
      try {
        const response = await fetch('/api/room-bookings', {
          headers: {
            'x-user-email': currentUser.email
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          // Filter bookings for the selected date
          const dateBookings = data.bookings.filter((booking: RoomBooking) => {
            const bookingDate = new Date(booking.bookingDate).toISOString().split('T')[0]
            return bookingDate === selectedDate
          })
          setBookings(dateBookings)
        }
      } catch (error) {
        console.error('Error loading bookings:', error)
      } finally {
        setIsLoadingBookings(false)
      }
    }
    
    loadBookings()
  }, [currentUser, selectedDate])

  const handleBookRoom = async () => {
    if (!currentUser?.email || !bookingFormData.startTime || !bookingFormData.endTime) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/room-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          ...bookingFormData,
          bookingDate: selectedDate
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to book room')
      }

      alert('✅ Room booked successfully!')
      setShowBookingForm(false)
      setBookingFormData({
        roomName: 'Treatment Room 1',
        startTime: '',
        endTime: '',
        serviceType: '',
        clientName: '',
        notes: ''
      })
      
      // Reload bookings
      const bookingsResponse = await fetch('/api/room-bookings', {
        headers: {
          'x-user-email': currentUser.email
        }
      })
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        const dateBookings = bookingsData.bookings.filter((booking: RoomBooking) => {
          const bookingDate = new Date(booking.bookingDate).toISOString().split('T')[0]
          return bookingDate === selectedDate
        })
        setBookings(dateBookings)
      }
    } catch (error) {
      console.error('Error booking room:', error)
      alert(error instanceof Error ? error.message : 'Failed to book room')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!currentUser?.email || !confirm('Are you sure you want to cancel this booking?')) return
    
    try {
      const response = await fetch('/api/room-bookings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({ bookingId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to cancel booking')
      }

      alert('✅ Booking cancelled successfully')
      
      // Reload bookings
      const bookingsResponse = await fetch('/api/room-bookings', {
        headers: {
          'x-user-email': currentUser.email
        }
      })
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        const dateBookings = bookingsData.bookings.filter((booking: RoomBooking) => {
          const bookingDate = new Date(booking.bookingDate).toISOString().split('T')[0]
          return bookingDate === selectedDate
        })
        setBookings(dateBookings)
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert(error instanceof Error ? error.message : 'Failed to cancel booking')
    }
  }

  const isSlotBooked = (roomName: string, startTime: string) => {
    return bookings.some(booking => 
      booking.roomName === roomName && 
      booking.startTime === `${selectedDate}T${startTime}:00` &&
      booking.status === 'confirmed'
    )
  }

  const getBookingForSlot = (roomName: string, startTime: string) => {
    return bookings.find(booking => 
      booking.roomName === roomName && 
      booking.startTime === `${selectedDate}T${startTime}:00` &&
      booking.status === 'confirmed'
    )
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar
        } : undefined} />
        <div className="max-w-7xl mx-auto px-3 py-4 pb-20 md:px-4 md:py-8 md:pb-8">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
      <NavBar user={currentUser ? {
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar
      } : undefined} />
      
      <div className="max-w-7xl mx-auto px-3 py-4 pb-20 md:px-4 md:py-8 md:pb-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 break-words">Treatment Room Booking</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Book treatment rooms for esthetic services in 1 hour 15 minute increments
              </p>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <Card className="mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-teal-600" />
                <Label htmlFor="booking-date" className="text-sm font-medium">Select Date</Label>
                <Input
                  id="booking-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="max-w-48"
                />
              </div>
              <Button
                onClick={() => setShowBookingForm(!showBookingForm)}
                className="bg-teal-600 hover:bg-teal-700"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Book Room
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        {showBookingForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">New Room Booking</CardTitle>
              <CardDescription>Select a room and time slot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="room-name">Room</Label>
                  <select
                    id="room-name"
                    value={bookingFormData.roomName}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, roomName: e.target.value })}
                    className="w-full mt-1 p-3 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    {availableRooms.map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="client-name">Client Name (Optional)</Label>
                  <Input
                    id="client-name"
                    value={bookingFormData.clientName}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, clientName: e.target.value })}
                    placeholder="Enter client name"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <select
                    id="start-time"
                    value={bookingFormData.startTime}
                    onChange={(e) => {
                      const selectedSlot = TIME_SLOTS.find(slot => slot.startTime === e.target.value)
                      setBookingFormData({ 
                        ...bookingFormData, 
                        startTime: e.target.value,
                        endTime: selectedSlot?.endTime || ''
                      })
                    }}
                    className="w-full mt-1 p-3 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select start time</option>
                    {TIME_SLOTS.map((slot, index) => (
                      <option key={index} value={slot.startTime}>
                        {formatTime(`${selectedDate}T${slot.startTime}:00`)} - {formatTime(`${selectedDate}T${slot.endTime}:00`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="service-type">Service Type (Optional)</Label>
                  <Input
                    id="service-type"
                    value={bookingFormData.serviceType}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, serviceType: e.target.value })}
                    placeholder="e.g., PMU, Lash Extension"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={bookingFormData.notes}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleBookRoom}
                  disabled={!bookingFormData.startTime || isSubmitting}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                </Button>
                <Button
                  onClick={() => setShowBookingForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Room Booking Calendar */}
        <div className="space-y-6">
          {availableRooms.map(room => (
            <Card key={room}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-teal-600" />
                    <CardTitle className="text-lg">{room}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {bookings.filter(b => b.roomName === room && b.status === 'confirmed').length} booked
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {TIME_SLOTS.map((slot, index) => {
                    const isBooked = isSlotBooked(room, slot.startTime)
                    const booking = getBookingForSlot(room, slot.startTime)
                    
                    return (
                      <div
                        key={index}
                        className={`border-2 rounded-lg p-3 transition-all ${
                          isBooked
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!isBooked) {
                            setBookingFormData({
                              ...bookingFormData,
                              roomName: room,
                              startTime: slot.startTime,
                              endTime: slot.endTime
                            })
                            setShowBookingForm(true)
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className={`h-4 w-4 ${isBooked ? 'text-red-600' : 'text-gray-600'}`} />
                              <span className="text-sm font-medium">
                                {formatTime(`${selectedDate}T${slot.startTime}:00`)} - {formatTime(`${selectedDate}T${slot.endTime}:00`)}
                              </span>
                            </div>
                            {isBooked && booking && (
                              <div className="mt-2 space-y-1">
                                <div className="text-xs font-medium text-red-900">
                                  {booking.user.name}
                                </div>
                                {booking.serviceType && (
                                  <div className="text-xs text-red-700">
                                    {booking.serviceType}
                                  </div>
                                )}
                                {booking.clientName && (
                                  <div className="text-xs text-red-600">
                                    Client: {booking.clientName}
                                  </div>
                                )}
                                {booking.user.id === currentUser?.id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCancelBooking(booking.id)
                                    }}
                                    className="mt-2 h-6 text-xs text-red-600 hover:text-red-800 hover:bg-red-100"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="ml-2">
                            {isBooked ? (
                              <CheckCircle className="h-5 w-5 text-red-600" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 space-y-2 text-sm text-blue-900">
                <p className="font-semibold">Important Notes:</p>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li>• Each time slot is 1 hour and 15 minutes (1 hour for service, 15 minutes for cleanup)</li>
                  <li>• Licensed estheticians must have a booth rent agreement on file</li>
                  <li>• You can only cancel your own bookings (or all bookings if you're an Owner, Director, or Manager)</li>
                  <li>• Bookings are confirmed immediately upon creation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

