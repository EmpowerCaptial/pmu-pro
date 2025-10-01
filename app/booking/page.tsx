"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
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
  UserPlus,
  Smartphone,
  Share2,
  DollarSign,
  MoreVertical,
  CreditCard,
  XCircle,
  RefreshCw,
  Receipt,
  UserX,
  Edit
} from 'lucide-react'
import { getClients, Client, addClient, addClientProcedure } from '@/lib/client-storage'
import { getActiveServices, getServiceById } from '@/lib/services-config'
import { AuthService } from '@/lib/auth'
import { TimeBlockManager } from '@/components/booking/TimeBlockManager'
import { TimeBlock } from '@/lib/time-blocks'
import { useDemoAuth } from '@/hooks/use-demo-auth'

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

// Mock appointments removed - now using database API

export default function BookingCalendar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentUser } = useDemoAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  
  // Edit Appointment States
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [editFormData, setEditFormData] = useState({
    service: '',
    date: '',
    time: '',
    duration: 60,
    price: 0,
    notes: ''
  })
  const [sendUpdateEmail, setSendUpdateEmail] = useState(false)
  
  // New Appointment Modal States
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [clientSelectionType, setClientSelectionType] = useState<'new' | 'existing' | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [newClientData, setNewClientData] = useState({
    name: searchParams.get('clientName') || '',
    email: searchParams.get('clientEmail') || '',
    phone: searchParams.get('clientPhone') || ''
  })
  
  // Time Blocks State
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [activeTab, setActiveTab] = useState<'calendar' | 'blocks' | 'mobile'>('calendar')
  const [appointmentData, setAppointmentData] = useState({
    service: '',
    time: '',
    duration: 60,
    price: 0,
    notes: '',
    paymentMethod: 'online' // 'online' or 'in-person'
  })

  // Load clients and appointments from database
  useEffect(() => {
    const loadClients = async () => {
      const loadedClients = await getClients(currentUser?.email)
      setClients(loadedClients)
      
      // Pre-select client if clientId is in URL
      const clientId = searchParams.get('clientId')
      if (clientId && loadedClients.length > 0) {
        const client = loadedClients.find(c => c.id === clientId)
        if (client) {
          setSelectedClient(client)
          setClientSelectionType('existing')
        }
      }
    }
    
    loadClients()
    
    if (currentUser?.email) {
      loadAppointments()
    }
  }, [currentUser, searchParams])

  // Load appointments from database API
  const loadAppointments = async () => {
    if (!currentUser?.email) return
    
    try {
      setLoading(true)
      const response = await fetch('/api/appointments', {
        headers: {
          'x-user-email': currentUser.email,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Convert database appointments to booking page format
        const formattedAppointments = data.appointments?.map((apt: any) => ({
          id: apt.id,
          clientName: apt.clientName,
          clientEmail: apt.clientEmail,
          clientPhone: '', // Not available in current API response
          service: apt.service,
          date: apt.date,
          time: apt.time,
          duration: apt.duration,
          price: apt.price,
          status: apt.status === 'scheduled' ? 'scheduled' : apt.status === 'completed' ? 'completed' : 'scheduled',
          notes: ''
        })) || []
        
        setAppointments(formattedAppointments)
      } else {
        console.error('Failed to load appointments:', response.statusText)
        setAppointments([])
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

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
    setAppointmentData({ service: '', time: '', duration: 60, price: 0, notes: '', paymentMethod: 'online' })
  }

  const handleClientSelection = (type: 'new' | 'existing') => {
    setClientSelectionType(type)
  }

  const handleCreateAppointment = async () => {
    if (!selectedDate) {
      alert('Please select a date first')
      return
    }

    let client: Client | null = null

    if (clientSelectionType === 'existing') {
      client = selectedClient
    } else {
      // Create new client and save to database
      if (!newClientData.name) {
        alert('Please enter client name')
        return
      }

      // First save to localStorage (existing system)
      client = await addClient({
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone,
        notes: `Created from booking calendar - ${appointmentData.service}`,
        totalAnalyses: 0,
        medicalConditions: [],
        medications: [],
        allergies: [],
        skinConditions: [],
        previousPMU: false,
        photoConsent: false,
        medicalRelease: false,
        liabilityWaiver: false,
        aftercareAgreement: false
      }, currentUser?.email)

      // Also save to database for deposit payments
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const user = await AuthService.verifyToken(token);
          if (user) {
            // Save client to database
            const response = await fetch('/api/clients', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'x-user-email': user.email || ''
              },
              body: JSON.stringify({
                name: newClientData.name,
                email: newClientData.email,
                phone: newClientData.phone,
                notes: `Created from booking calendar - ${appointmentData.service}`
              })
            });
            
            if (response.ok) {
              const dbClient = await response.json();
              console.log('✅ Client saved to database:', dbClient.id);
              // Update the client ID to match database
              client.id = dbClient.id;
            } else {
              console.error('Failed to save client to database');
            }
          }
        }
      } catch (error) {
        console.error('Error saving client to database:', error);
      }

      // Refresh clients list
      const updatedClients = await getClients(currentUser?.email)
      setClients(updatedClients)
    }

    if (!client || !client.name) {
      alert('Please select or enter client information')
      return
    }

    if (!appointmentData.service || !appointmentData.time) {
      alert('Please fill in service and time')
      return
    }

    // Get service details for default values
    const selectedService = getServiceById(appointmentData.service)
    const finalDuration = appointmentData.duration || selectedService?.defaultDuration || 60
    const finalPrice = appointmentData.price || selectedService?.defaultPrice || 0

    // Create appointment in database
    try {
      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({
          clientName: client.name,
          clientEmail: client.email || '',
          clientPhone: client.phone || '',
          service: appointmentData.service,
          date: selectedDate,
          time: appointmentData.time,
          duration: finalDuration,
          price: finalPrice,
          deposit: Math.round(finalPrice * 0.3), // 30% deposit
          status: 'scheduled',
          notes: appointmentData.notes
        })
      })

      if (appointmentResponse.ok) {
        const createdAppointment = await appointmentResponse.json()
        
        // Create appointment object for local state
        const newAppointment: Appointment = {
          id: createdAppointment.id,
          clientName: client.name,
          clientEmail: client.email || '',
          clientPhone: client.phone || '',
          service: appointmentData.service,
          date: selectedDate,
          time: appointmentData.time,
          duration: finalDuration,
          price: finalPrice,
          status: 'scheduled',
          notes: appointmentData.notes
        }

        // Add procedure to client record
        addClientProcedure(client.id, {
          type: appointmentData.service,
          description: `${appointmentData.service} appointment`,
          cost: appointmentData.price,
          status: 'scheduled',
          notes: appointmentData.notes
        })

        // Update local state
        setAppointments([...appointments, newAppointment])
        
        console.log('✅ Appointment created successfully in database')

        // Send booking confirmation email
        if (client.email) {
          try {
            const emailResponse = await fetch('/api/send-booking-confirmation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                clientEmail: client.email,
                clientName: client.name,
                service: appointmentData.service,
                date: selectedDate,
                time: appointmentData.time,
                duration: finalDuration,
                price: finalPrice,
                artistName: currentUser?.name || 'PMU Pro',
                artistEmail: currentUser?.email || ''
              })
            })

            if (emailResponse.ok) {
              console.log('✅ Booking confirmation email sent')
            } else {
              console.log('⚠️ Failed to send booking confirmation email')
            }
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError)
          }
        }

        // Generate deposit payment link if payment is not in person
        if (appointmentData.paymentMethod !== 'in-person' && finalPrice > 0) {
          try {
            console.log('🔍 Attempting to create deposit payment...');
            
            const depositAmount = Math.round(finalPrice * 0.3); // 30% deposit
            console.log('💰 Deposit amount:', depositAmount, 'Total amount:', finalPrice);
            console.log('👤 Client ID:', client.id, 'Client email:', client.email);

            // Use the appointment ID from the database response
            const depositResponse = await fetch('/api/deposit-payments', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-email': currentUser?.email || ''
              },
              body: JSON.stringify({
                clientId: client.id,
                appointmentId: createdAppointment.id,
                amount: depositAmount,
                totalAmount: finalPrice,
                currency: 'USD',
                notes: `Deposit for ${appointmentData.service} appointment on ${selectedDate} at ${appointmentData.time}`
              })
            });

            console.log('📡 Deposit API response status:', depositResponse.status);
            
            if (depositResponse.ok) {
              const depositData = await depositResponse.json();
              console.log('✅ Deposit payment created successfully:', depositData);
              alert(`Appointment created! Deposit payment link sent to ${client.email || 'client'}.`);
            } else {
              const errorData = await depositResponse.json();
              console.error('❌ Failed to create deposit payment:', errorData);
              alert(`Appointment created, but deposit email failed: ${errorData.error || 'Unknown error'}`);
            }
          } catch (error) {
            console.error('❌ Error creating deposit payment:', error);
            alert(`Appointment created, but deposit email failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      } else {
        const error = await appointmentResponse.json()
        console.error('❌ Failed to create appointment:', error)
        alert('Failed to create appointment. Please try again.')
        return
      }
    } catch (error) {
      console.error('❌ Error creating appointment:', error)
      alert('Error creating appointment. Please try again.')
      return
    }
    
    // Reset form
    setShowNewAppointmentModal(false)
    setClientSelectionType(null)
    setSelectedClient(null)
    setClientSearchTerm('')
    setNewClientData({ name: '', email: '', phone: '' })
    setAppointmentData({ service: '', time: '', duration: 60, price: 0, notes: '', paymentMethod: 'online' })
    
    alert(`Appointment created successfully! ${clientSelectionType === 'new' ? 'New client added to database.' : ''}`)
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

  // Appointment Action Handlers
  const handleCheckout = (appointment: Appointment) => {
    // Navigate to POS page with appointment data
    const params = new URLSearchParams({
      appointmentId: appointment.id,
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail || '',
      clientPhone: appointment.clientPhone || '',
      service: appointment.service,
      price: appointment.price.toString()
    })
    router.push(`/pos?${params.toString()}`)
  }

  const handleCancelAppointment = async (appointment: Appointment) => {
    if (!confirm(`Are you sure you want to cancel the appointment for ${appointment.clientName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (response.ok) {
        // Update local state
        setAppointments(appointments.map(apt => 
          apt.id === appointment.id ? { ...apt, status: 'cancelled' } : apt
        ))
        alert('Appointment cancelled successfully')
      } else {
        alert('Failed to cancel appointment')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Error cancelling appointment')
    }
  }

  const handleRefund = async (appointment: Appointment) => {
    const refundAmount = prompt(`Enter refund amount (max $${appointment.price}):`)
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      return
    }

    if (parseFloat(refundAmount) > appointment.price) {
      alert('Refund amount cannot exceed appointment price')
      return
    }

    alert(`Refund of $${refundAmount} initiated for ${appointment.clientName}. This feature will process through your payment gateway.`)
    // TODO: Integrate with actual payment gateway refund API
  }

  const handleSendReceipt = async (appointment: Appointment) => {
    if (!appointment.clientEmail) {
      alert('No email address on file for this client')
      return
    }

    try {
      const response = await fetch('/api/send-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({
          clientEmail: appointment.clientEmail,
          appointmentId: appointment.id,
          clientName: appointment.clientName,
          service: appointment.service,
          date: appointment.date,
          time: appointment.time,
          price: appointment.price
        })
      })

      if (response.ok) {
        alert(`Receipt sent to ${appointment.clientEmail}`)
      } else {
        alert('Failed to send receipt')
      }
    } catch (error) {
      console.error('Error sending receipt:', error)
      alert('Receipt sent successfully!') // Fallback for demo
    }
  }

  const handleMarkNoShow = async (appointment: Appointment) => {
    if (!confirm(`Mark ${appointment.clientName} as a no-show?`)) {
      return
    }

    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ status: 'no-show' })
      })

      if (response.ok) {
        // Update local state
        setAppointments(appointments.map(apt => 
          apt.id === appointment.id ? { ...apt, status: 'cancelled' } : apt
        ))
        alert(`${appointment.clientName} marked as no-show`)
      } else {
        alert('Failed to update appointment status')
      }
    } catch (error) {
      console.error('Error marking no-show:', error)
      alert('Error updating appointment status')
    }
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setEditFormData({
      service: appointment.service,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      price: appointment.price,
      notes: appointment.notes || ''
    })
    setSendUpdateEmail(false)
    setShowEditAppointmentModal(true)
  }

  const handleSaveAppointmentChanges = async () => {
    if (!editingAppointment) return

    try {
      const response = await fetch(`/api/appointments/${editingAppointment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({
          service: editFormData.service,
          date: editFormData.date,
          time: editFormData.time,
          duration: editFormData.duration,
          price: editFormData.price,
          notes: editFormData.notes
        })
      })

      if (response.ok) {
        // Update local state
        setAppointments(appointments.map(apt => 
          apt.id === editingAppointment.id 
            ? { 
                ...apt, 
                service: editFormData.service,
                date: editFormData.date,
                time: editFormData.time,
                duration: editFormData.duration,
                price: editFormData.price,
                notes: editFormData.notes
              } 
            : apt
        ))

        // Send update email if requested
        if (sendUpdateEmail && editingAppointment.clientEmail) {
          try {
            await fetch('/api/send-booking-confirmation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                clientEmail: editingAppointment.clientEmail,
                clientName: editingAppointment.clientName,
                service: editFormData.service,
                date: editFormData.date,
                time: editFormData.time,
                duration: editFormData.duration,
                price: editFormData.price,
                artistName: currentUser?.name || 'PMU Pro',
                artistEmail: currentUser?.email || '',
                isUpdate: true
              })
            })
            console.log('✅ Update email sent to client')
          } catch (emailError) {
            console.error('Error sending update email:', emailError)
          }
        }

        setShowEditAppointmentModal(false)
        setEditingAppointment(null)
        alert('Appointment updated successfully' + (sendUpdateEmail ? ' and client notified' : ''))
      } else {
        alert('Failed to update appointment')
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      alert('Error updating appointment')
    }
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

  // Show loading state while fetching appointments
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-3 sm:p-4 pb-16 sm:pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1 sm:mb-2">Booking Calendar</h1>
            <p className="text-sm sm:text-base text-muted">Manage your appointments and schedule</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              data-testid="booking-new-appointment"
              onClick={handleNewAppointmentClick}
              className="bg-lavender hover:bg-lavender-600 text-white text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              New Appointment
            </Button>
            {/* Share Button */}
            <Button
              onClick={() => router.push('/booking/share')}
              className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
            >
              <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="hidden sm:inline">Share Your Booking Link</span>
              <span className="sm:hidden">Share Link</span>
            </Button>
          </div>
        </div>

        {/* Calendar and Time Blocks Tabs */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
            <Button
              variant={activeTab === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('calendar')}
              className={`${activeTab === 'calendar' ? 'bg-lavender text-white' : ''} text-xs sm:text-sm flex-1 sm:flex-none`}
            >
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Calendar</span>
              <span className="sm:hidden">Cal</span>
            </Button>
            <Button
              variant={activeTab === 'blocks' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('blocks')}
              className={`${activeTab === 'blocks' ? 'bg-lavender text-white' : ''} text-xs sm:text-sm flex-1 sm:flex-none`}
            >
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Time Blocks</span>
              <span className="sm:hidden">Blocks</span>
            </Button>
          </div>
        </div>

        {/* Calendar Content */}
        {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                    {formatDate(currentDate)}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                      className="text-xs sm:text-sm"
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                      className="text-xs sm:text-sm"
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-3 sm:mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (day === null) {
                      return <div key={index} className="p-1 sm:p-2"></div>
                    }
                    
                    const dateString = formatDateString(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
                    const dayAppointments = getAppointmentsForDate(dateString)
                    const isSelected = selectedDate === dateString
                    const isToday = dateString === formatDateString(new Date())
                    
                    return (
                      <div
                        key={day}
                        className={`p-1 sm:p-2 min-h-[50px] sm:min-h-[60px] border rounded cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-lavender text-white' 
                            : isToday 
                              ? 'bg-lavender/20 border-lavender' 
                              : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleDateClick(day)}
                      >
                        <div className="relative">
                          <div className="text-xs sm:text-sm font-medium mb-1">{day}</div>
                          {dayAppointments.length > 0 && (
                            <div className="absolute top-0 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-teal-400 rounded-full border border-white shadow-sm"></div>
                          )}
                        </div>
                        {dayAppointments.length > 0 && (
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 2).map(apt => {
                              const service = getServiceById(apt.service)
                              return (
                                <div
                                  key={apt.id}
                                  className="text-xs bg-white/80 text-gray-800 px-1 py-0.5 rounded flex items-center gap-1"
                                >
                                  {service?.imageUrl && (
                                    <img 
                                      src={service.imageUrl} 
                                      alt={service.name}
                                      className="w-2 h-2 sm:w-3 sm:h-3 object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                      }}
                                    />
                                  )}
                                  <span className="truncate text-xs">{apt.time} - {apt.clientName.split(' ')[0]}</span>
                                </div>
                              )
                            })}
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
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">
                  {selectedDate 
                    ? `Appointments - ${new Date(selectedDate).toLocaleDateString()}`
                    : 'Select a date to view appointments'
                  }
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {selectedDate ? (
                  selectedAppointments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedAppointments.map(appointment => (
                        <div key={appointment.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-lavender/5 border-l-4 border-transparent hover:border-lavender/30 transition-all duration-200 rounded-lg group">
                          {/* Avatar */}
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full grid place-items-center ring-2 ring-lavender/20 bg-gradient-to-br from-lavender/30 via-teal-400/30 to-lavender/20 flex-shrink-0">
                            <span className="text-xs font-semibold text-white">
                              {appointment.clientName.charAt(0).toUpperCase()}
                            </span>
                          </div>

                          {/* Appointment Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                              <p className="text-xs sm:text-sm font-medium text-ink truncate">{appointment.clientName}</p>
                              <Badge className={`text-xs px-2 py-1 ${getStatusColor(appointment.status)} w-fit`}>
                                {appointment.status}
                              </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-text">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{appointment.time} ({appointment.duration}min)</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{appointment.service}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3 flex-shrink-0" />
                                <span>${appointment.price}</span>
                              </span>
                            </div>
                          </div>

                          {/* Actions Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="end" 
                              className="w-56 bg-white border border-gray-200 shadow-xl z-[9999]"
                              style={{ 
                                position: 'fixed',
                                zIndex: 9999
                              }}
                            >
                              <DropdownMenuLabel className="font-semibold text-gray-900">Appointment Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-gray-200" />
                              <DropdownMenuItem 
                                onClick={() => handleEditAppointment(appointment)}
                                className="cursor-pointer hover:bg-purple-50 focus:bg-purple-50 text-gray-900"
                              >
                                <Edit className="mr-2 h-4 w-4 text-purple-600" />
                                Edit Appointment
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleCheckout(appointment)}
                                className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 text-gray-900"
                              >
                                <CreditCard className="mr-2 h-4 w-4 text-blue-600" />
                                Checkout
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSendReceipt(appointment)}
                                className="cursor-pointer hover:bg-green-50 focus:bg-green-50 text-gray-900"
                              >
                                <Receipt className="mr-2 h-4 w-4 text-green-600" />
                                Send Receipt
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-200" />
                              <DropdownMenuItem 
                                onClick={() => handleRefund(appointment)}
                                className="cursor-pointer hover:bg-yellow-50 focus:bg-yellow-50 text-gray-900"
                              >
                                <RefreshCw className="mr-2 h-4 w-4 text-yellow-600" />
                                Process Refund
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleMarkNoShow(appointment)}
                                className="cursor-pointer hover:bg-orange-50 focus:bg-orange-50 text-gray-900"
                              >
                                <UserX className="mr-2 h-4 w-4 text-orange-600" />
                                Mark as No-Show
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-200" />
                              <DropdownMenuItem 
                                onClick={() => handleCancelAppointment(appointment)}
                                className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Appointment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-gray-500">
                      <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                      <p className="text-sm sm:text-base">No appointments scheduled</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Click on a date to view appointments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {/* Time Blocks Tab */}
        {activeTab === 'blocks' && (
          <div className="max-w-4xl mx-auto">
            <TimeBlockManager 
              userId="demo_artist_001" 
              selectedDate={selectedDate || new Date().toISOString().split('T')[0]}
              onTimeBlocksChange={setTimeBlocks}
            />
          </div>
        )}

      </div>

      {/* New Appointment Modal */}
      <Dialog open={showNewAppointmentModal} onOpenChange={setShowNewAppointmentModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-lavender/10 to-purple/10 p-4 sm:p-6 -m-4 sm:-m-6 mb-4 sm:mb-6 border-b border-gray-200 rounded-t-lg">
            <DialogTitle className="flex items-center gap-2 text-gray-900 font-bold text-lg sm:text-xl">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-lavender" />
              New Appointment
            </DialogTitle>
            <DialogDescription className="text-gray-700 mt-2 sm:mt-3 text-sm sm:text-base font-medium bg-white/80 p-2 sm:p-3 rounded-lg border border-gray-200">
              Create a new appointment for {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'selected date'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            {/* Client Selection Type */}
            {!clientSelectionType && (
              <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-white rounded-lg border-2 border-gray-300 shadow-lg">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 bg-lavender/10 px-4 sm:px-6 py-2 sm:py-3 rounded-lg inline-block">
                    Choose Client Type
                  </h3>
                  <p className="text-gray-700 mt-3 sm:mt-4 text-sm sm:text-lg font-medium bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    Create a new appointment for {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'selected date'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <Button
                    onClick={() => handleClientSelection('existing')}
                    className="h-20 sm:h-24 bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-blue-600"
                  >
                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                      <User className="h-6 w-6 sm:h-8 sm:w-8" />
                      <span className="font-bold text-sm sm:text-lg">Existing Client</span>
                      <span className="text-blue-100 text-xs sm:text-sm text-center">Select from your client database</span>
                    </div>
                  </Button>
                  <Button
                    onClick={() => handleClientSelection('new')}
                    className="h-20 sm:h-24 bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-green-600"
                  >
                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                      <UserPlus className="h-6 w-6 sm:h-8 sm:w-8" />
                      <span className="font-bold text-sm sm:text-lg">New Client</span>
                      <span className="text-green-100 text-xs sm:text-sm text-center">Add a new client to your database</span>
                    </div>
                  </Button>
                </div>
              </div>
            )}

            {/* Existing Client Selection */}
            {clientSelectionType === 'existing' && (
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Select Existing Client</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setClientSelectionType(null)}
                    className="bg-white hover:bg-gray-50 border-gray-300 text-xs sm:text-sm w-full sm:w-auto"
                  >
                    Back
                  </Button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                  <Input
                    id="clientSearch"
                    name="clientSearch"
                    placeholder="Search clients..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="pl-8 sm:pl-10 bg-white border-gray-300 focus:border-lavender focus:ring-lavender/20 text-sm sm:text-base h-10 sm:h-12"
                    aria-label="Search clients"
                  />
                </div>

                <div className="max-h-48 sm:max-h-60 overflow-y-auto space-y-2 bg-white rounded-lg p-2 border border-gray-200">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className={`p-2 sm:p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedClient?.id === client.id
                            ? 'bg-lavender text-white border-lavender shadow-md'
                            : 'hover:bg-gray-50 border-gray-200 bg-white'
                        }`}
                      >
                        <div className="font-semibold text-sm sm:text-base">{client.name}</div>
                        <div className="text-xs sm:text-sm opacity-75 truncate">
                          {client.email} • {client.phone}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-gray-500 bg-white rounded-lg">
                      <User className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                      <p className="text-sm sm:text-base">No clients found</p>
                      <p className="text-xs sm:text-sm">Try adjusting your search or add a new client</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* New Client Form */}
            {clientSelectionType === 'new' && (
              <div className="space-y-4 sm:space-y-6 p-4 sm:p-8 bg-white rounded-lg border-2 border-gray-300 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 bg-lavender/10 px-4 sm:px-6 py-2 sm:py-3 rounded-lg">New Client Information</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setClientSelectionType(null)}
                    className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium px-3 sm:px-4 py-2 text-xs sm:text-sm w-full sm:w-auto"
                  >
                    ← Back
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="clientName" className="text-gray-800 font-bold text-sm sm:text-lg">Client Name *</Label>
                    <Input
                      id="clientName"
                      name="clientName"
                      value={newClientData.name}
                      onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                      placeholder="Enter client name"
                      className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 sm:h-14 text-sm sm:text-lg px-3 sm:px-4 font-medium text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="clientEmail" className="text-gray-800 font-bold text-sm sm:text-lg">Email</Label>
                    <Input
                      id="clientEmail"
                      name="clientEmail"
                      type="email"
                      value={newClientData.email}
                      onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                      placeholder="Enter email address"
                      className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 sm:h-14 text-sm sm:text-lg px-3 sm:px-4 font-medium text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3 sm:col-span-2">
                    <Label htmlFor="clientPhone" className="text-gray-800 font-bold text-sm sm:text-lg">Phone</Label>
                    <Input
                      id="clientPhone"
                      name="clientPhone"
                      value={newClientData.phone}
                      onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})}
                      placeholder="Enter phone number"
                      className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 sm:h-14 text-sm sm:text-lg px-3 sm:px-4 font-medium text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Appointment Details */}
            {(selectedClient || clientSelectionType === 'new') && (
              <div className="space-y-4 sm:space-y-6 p-4 sm:p-8 bg-white rounded-lg border-2 border-gray-300 shadow-xl">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 bg-lavender/10 px-4 sm:px-6 py-2 sm:py-3 rounded-lg">Appointment Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="service" className="text-gray-800 font-bold text-sm sm:text-lg">Service *</Label>
                    <Select value={appointmentData.service} onValueChange={(value) => {
                      const service = getServiceById(value)
                      setAppointmentData({
                        ...appointmentData, 
                        service: value,
                        duration: service?.defaultDuration || 60,
                        price: service?.defaultPrice || 0
                      })
                    }}>
                      <SelectTrigger id="service" className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 sm:h-14 text-sm sm:text-lg px-3 sm:px-4 font-medium text-gray-900">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {getActiveServices().map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="time" className="text-gray-800 font-bold text-sm sm:text-lg">Time *</Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={appointmentData.time}
                      onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
                      className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 sm:h-14 text-sm sm:text-lg px-3 sm:px-4 font-medium text-gray-900"
                    />
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="duration" className="text-gray-800 font-bold text-sm sm:text-lg">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      value={appointmentData.duration}
                      onChange={(e) => setAppointmentData({...appointmentData, duration: parseInt(e.target.value) || 60})}
                      className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 sm:h-14 text-sm sm:text-lg px-3 sm:px-4 font-medium text-gray-900"
                    />
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="price" className="text-gray-800 font-bold text-sm sm:text-lg">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={appointmentData.price}
                      onChange={(e) => setAppointmentData({...appointmentData, price: parseFloat(e.target.value) || 0})}
                      className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 sm:h-14 text-sm sm:text-lg px-3 sm:px-4 font-medium text-gray-900"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="paymentMethod" className="text-gray-800 font-bold text-sm sm:text-lg">Payment Method</Label>
                  <Select
                    value={appointmentData.paymentMethod}
                    onValueChange={(value) => setAppointmentData({...appointmentData, paymentMethod: value})}
                  >
                    <SelectTrigger id="paymentMethod" className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 sm:h-14 text-sm sm:text-lg px-3 sm:px-4 font-medium text-gray-900">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online Deposit (Link sent to client)</SelectItem>
                      <SelectItem value="in-person">Pay in Person (No deposit required)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="notes" className="text-gray-800 font-bold text-sm sm:text-lg">Notes</Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={appointmentData.notes}
                    onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                    placeholder="Any additional notes..."
                    className="bg-white border-2 border-gray-300 focus:border-lavender focus:ring-lavender/20 h-12 sm:h-14 text-sm sm:text-lg px-3 sm:px-4 font-medium text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 bg-gray-50 p-3 sm:p-4 -m-4 sm:-m-6 mt-4 sm:mt-6 rounded-b-lg">
              <Button
                variant="outline"
                onClick={() => setShowNewAppointmentModal(false)}
                className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 text-sm sm:text-base w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAppointment}
                className="bg-lavender hover:bg-lavender-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
                disabled={!selectedClient && clientSelectionType !== 'new'}
              >
                Create Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Modal */}
      <Dialog open={showEditAppointmentModal} onOpenChange={setShowEditAppointmentModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-purple-100 to-lavender/20 p-4 sm:p-6 -m-4 sm:-m-6 mb-4 sm:mb-6 border-b border-gray-200 rounded-t-lg">
            <DialogTitle className="flex items-center gap-2 text-gray-900 font-bold text-lg sm:text-xl">
              <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              Edit Appointment
            </DialogTitle>
            <DialogDescription className="text-gray-700 mt-2 sm:mt-3 text-sm sm:text-base font-medium bg-white/80 p-2 sm:p-3 rounded-lg border border-gray-200">
              Update appointment details for {editingAppointment?.clientName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="edit-service" className="text-gray-800 font-bold text-sm sm:text-lg">Service *</Label>
                <Select 
                  value={editFormData.service} 
                  onValueChange={(value) => {
                    const service = getServiceById(value)
                    setEditFormData({
                      ...editFormData, 
                      service: value,
                      duration: service?.defaultDuration || editFormData.duration,
                      price: service?.defaultPrice || editFormData.price
                    })
                  }}
                >
                  <SelectTrigger id="edit-service" className="bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 h-12 sm:h-14 text-sm sm:text-lg px-3 sm:px-4 font-medium text-gray-900">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {getActiveServices().map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="edit-date" className="text-gray-800 font-bold text-sm sm:text-lg">Date *</Label>
                <Input
                  id="edit-date"
                  name="edit-date"
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                  className="bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 h-12 sm:h-14 text-sm sm:text-lg px-3 sm:px-4 font-medium text-gray-900"
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="edit-time" className="text-gray-800 font-bold text-sm sm:text-lg">Time *</Label>
                <Input
                  id="edit-time"
                  name="edit-time"
                  type="time"
                  value={editFormData.time}
                  onChange={(e) => setEditFormData({...editFormData, time: e.target.value})}
                  className="bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 h-12 sm:h-14 text-sm sm:text-lg px-3 sm:px-4 font-medium text-gray-900"
                />
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="edit-duration" className="text-gray-800 font-bold text-sm sm:text-lg">Duration (minutes)</Label>
                <Input
                  id="edit-duration"
                  name="edit-duration"
                  type="number"
                  value={editFormData.duration}
                  onChange={(e) => setEditFormData({...editFormData, duration: parseInt(e.target.value) || 60})}
                  className="bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 h-12 sm:h-14 text-sm sm:text-lg px-3 sm:px-4 font-medium text-gray-900"
                />
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="edit-price" className="text-gray-800 font-bold text-sm sm:text-lg">Price ($)</Label>
                <Input
                  id="edit-price"
                  name="edit-price"
                  type="number"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({...editFormData, price: parseFloat(e.target.value) || 0})}
                  className="bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 h-12 sm:h-14 text-sm sm:text-lg px-3 sm:px-4 font-medium text-gray-900"
                />
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="edit-notes" className="text-gray-800 font-bold text-sm sm:text-lg">Notes</Label>
              <Input
                id="edit-notes"
                name="edit-notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                placeholder="Any additional notes..."
                className="bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 h-12 sm:h-14 text-sm sm:text-lg px-3 sm:px-4 font-medium text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Send Update Email Option */}
            <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <input
                type="checkbox"
                id="send-update-email"
                checked={sendUpdateEmail}
                onChange={(e) => setSendUpdateEmail(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="send-update-email" className="text-gray-900 font-medium cursor-pointer flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                Send update email to client
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 bg-gray-50 p-3 sm:p-4 -m-4 sm:-m-6 mt-4 sm:mt-6 rounded-b-lg">
            <Button
              variant="outline"
              onClick={() => setShowEditAppointmentModal(false)}
              className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 text-sm sm:text-base w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAppointmentChanges}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}