"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Shield,
  GraduationCap,
  ChevronDown,
  Star,
  MapPin,
  Phone,
  Mail,
  X,
  RefreshCw,
  Info
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { getServices, Service } from '@/lib/services-api'
import { checkStudioSupervisionAccess, shouldUseSupervisionBooking } from '@/lib/studio-supervision-gate'
import { FeatureAccessGate } from '@/components/ui/feature-access-gate'
import { FEATURES } from '@/lib/feature-access'
import { NavBar } from '@/components/ui/navbar'

// Mock data for instructors and bookings
const mockInstructors = [
  {
    id: '1',
    name: 'Sarah Johnson',
    specialty: 'Eyebrow Microblading',
    experience: '8 years',
    rating: 4.9,
    location: 'Universal Beauty Studio',
    phone: '(555) 123-4567',
    email: 'sarah@universalbeautystudio.com',
    avatar: '/images/instructor1.jpg'
  },
  {
    id: '2', 
    name: 'Michael Chen',
    specialty: 'Lip Blushing',
    experience: '6 years',
    rating: 4.8,
    location: 'Universal Beauty Studio',
    phone: '(555) 987-6543',
    email: 'michael@universalbeautystudio.com',
    avatar: '/images/instructor2.jpg'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    specialty: 'Eyeliner & Lash Enhancement',
    experience: '10 years',
    rating: 5.0,
    location: 'Universal Beauty Studio',
    phone: '(555) 456-7890',
    email: 'emma@universalbeautystudio.com',
    avatar: '/images/instructor3.jpg'
  }
]

const timeSlots = ['9:30 AM', '1:00 PM', '4:00 PM']

// Default supervision services (fallback if no services loaded)
const defaultSupervisionServices = [
  { id: 'microblading', name: 'Eyebrow Microblading', duration: '2 hours', deposit: 150, total: 400 },
  { id: 'powder-brows', name: 'Powder Brows', duration: '2 hours', deposit: 150, total: 400 },
  { id: 'lip-blushing', name: 'Lip Blushing', duration: '2 hours', deposit: 150, total: 400 },
  { id: 'eyeliner', name: 'Eyeliner', duration: '2 hours', deposit: 150, total: 400 },
  { id: 'lash-enhancement', name: 'Lash Enhancement', duration: '2 hours', deposit: 150, total: 400 },
  { id: 'color-correction', name: 'Color Correction', duration: '2 hours', deposit: 150, total: 400 }
]

export default function StudioSupervisionPage() {
  const { currentUser, isLoading } = useDemoAuth()
  const router = useRouter()
  const [supervisionAccess, setSupervisionAccess] = useState<any>(null)
  const [userRole, setUserRole] = useState<'INSTRUCTOR' | 'APPRENTICE' | 'ADMIN' | 'NONE'>('NONE')
  const [activeTab, setActiveTab] = useState<string>('overview')
  
  // Booking system state
  const [selectedInstructor, setSelectedInstructor] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [showBookingModal, setShowBookingModal] = useState(false)
  
  // Client information state
  const [clientInfo, setClientInfo] = useState({
    name: '',
    phone: '',
    email: '',
    service: ''
  })
  const [showClientForm, setShowClientForm] = useState(false)
  const [bookingStatus, setBookingStatus] = useState<'pending' | 'deposit-sent' | 'confirmed' | 'completed'>('pending')
  
  // Procedure logging state
  const [procedureForm, setProcedureForm] = useState({
    clientName: '',
    clientDOB: '',
    procedureDate: '',
    procedureType: '',
    supervisorName: '',
    supervisorLicense: '',
    procedureNotes: ''
  })
  const [loggedProcedures, setLoggedProcedures] = useState<any[]>([])
  
  // Messaging system state
  const [messages, setMessages] = useState<any[]>([])
  const [showMessageComposer, setShowMessageComposer] = useState(false)
  const [selectedInstructorForMessage, setSelectedInstructorForMessage] = useState<string>('')
  const [newMessage, setNewMessage] = useState({
    to: '',
    subject: '',
    content: ''
  })

  // Dynamic services state
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)

  // Instructor availability state
  const [instructorAvailability, setInstructorAvailability] = useState<any>({})
  const [instructorBookings, setInstructorBookings] = useState<any>({}) // Real appointments from booking page
  const [showAvailabilityManager, setShowAvailabilityManager] = useState(false)
  const [selectedInstructorForAvailability, setSelectedInstructorForAvailability] = useState<string>('')
  const [newAvailability, setNewAvailability] = useState({
    date: '',
    timeSlots: [] as string[],
    isBlocked: false,
    reason: ''
  })
  

  // Load logged procedures from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProcedures = localStorage.getItem('logged-procedures')
      if (savedProcedures) {
        setLoggedProcedures(JSON.parse(savedProcedures))
      }

      // Load instructor availability from localStorage
      const savedAvailability = localStorage.getItem('instructor-availability')
      if (savedAvailability) {
        setInstructorAvailability(JSON.parse(savedAvailability))
      }

      // Load instructor bookings from localStorage (cached real appointments)
      const savedBookings = localStorage.getItem('instructor-bookings')
      if (savedBookings) {
        setInstructorBookings(JSON.parse(savedBookings))
      }
    }
  }, [])

  // Map API services to supervision service format
  const mapApiServiceToSupervisionService = (apiService: Service) => ({
    id: apiService.id,
    name: apiService.name,
    duration: `${Math.floor(apiService.defaultDuration / 60)}h ${apiService.defaultDuration % 60}m`,
    deposit: Math.round(apiService.defaultPrice * 0.3), // 30% deposit
    total: apiService.defaultPrice
  })

  // Fetch instructor bookings from API
  const fetchInstructorBookings = async (instructorEmail: string, date?: string) => {
    try {
      const url = `/api/studio/instructor-availability?instructorEmail=${encodeURIComponent(instructorEmail)}${date ? `&date=${date}` : ''}`
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        
        // Store in state
        const updatedBookings = {
          ...instructorBookings,
          [instructorEmail]: {
            blockedTimes: data.blockedTimes,
            lastUpdated: data.summary.lastUpdated,
            totalAppointments: data.summary.totalAppointments
          }
        }
        
        setInstructorBookings(updatedBookings)
        
        // Cache in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('instructor-bookings', JSON.stringify(updatedBookings))
        }
        
        return data.blockedTimes
      } else {
        console.error('Failed to fetch instructor bookings:', response.statusText)
        return []
      }
    } catch (error) {
      console.error('Error fetching instructor bookings:', error)
      return []
    }
  }

  // Load services from API
  useEffect(() => {
    const loadServices = async () => {
      if (!currentUser?.email) return
      
      setServicesLoading(true)
      try {
        const services = await getServices(currentUser.email)
        const activeServices = services.filter(service => service.isActive)
        const mappedServices = activeServices.map(mapApiServiceToSupervisionService)
        setAvailableServices(mappedServices as any)
        console.log('Loaded services:', mappedServices)
      } catch (error) {
        console.error('Error loading services:', error)
        // Fallback to default services
        setAvailableServices([])
      } finally {
        setServicesLoading(false)
      }
    }

    loadServices()
  }, [currentUser?.email])

  // Load messages from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('supervision-messages')
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages))
      }
    }
  }, [])

  useEffect(() => {
    if (currentUser && !isLoading) {
      // Check Enterprise Studio access
      const accessCheck = checkStudioSupervisionAccess({
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role || 'artist',
        selectedPlan: currentUser.subscription || 'starter',
        isLicenseVerified: (currentUser as any).isLicenseVerified || false,
        hasActiveSubscription: (currentUser as any).hasActiveSubscription || false
      })

      // Temporary fix for Tyrone - allow access regardless of access check
      if (currentUser.email?.toLowerCase() === 'tyronejackboy@gmail.com') {
        setSupervisionAccess({
          canAccess: true,
          isEnterpriseStudio: true,
          userRole: 'INSTRUCTOR'
        })
        setUserRole('INSTRUCTOR')
      } else {
        setSupervisionAccess(accessCheck)
        setUserRole(accessCheck.userRole)
      }
    }
  }, [currentUser, isLoading])

  // Set default tab based on user role and URL parameters
  useEffect(() => {
    if (userRole !== 'NONE') {
      // Check for URL parameter first
      const urlParams = new URLSearchParams(window.location.search)
      const tabParam = urlParams.get('tab')
      
      if (tabParam && ['overview', 'find', 'availability', 'history', 'reports'].includes(tabParam)) {
        setActiveTab(tabParam)
      } else {
        // Set default based on role
        if (userRole === 'APPRENTICE') {
          // Students should start on the booking tab
          setActiveTab('find')
        } else if (userRole === 'INSTRUCTOR') {
          // Instructors should start on the availability tab
          setActiveTab('availability')
        } else {
          // Admins start on overview
          setActiveTab('overview')
        }
      }
    }
  }, [userRole])

  // Load existing bookings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBookings = localStorage.getItem('supervision-bookings')
      if (storedBookings) {
        setBookings(JSON.parse(storedBookings))
      }
    }
  }, [])

  // Get available time slots for selected instructor and date
  const getAvailableSlots = (instructorId: string, date: string) => {
    const existingBookings = bookings.filter(
      booking => booking.instructorId === instructorId && booking.date === date
    )
    const bookedTimes = existingBookings.map(booking => booking.time)
    
    // Find the instructor to get their email
    const instructor = mockInstructors.find(i => i.id === instructorId)
    const instructorEmail = instructor?.email
    
    // Get real bookings from the booking page (client appointments)
    const realBookings = instructorEmail ? instructorBookings[instructorEmail]?.blockedTimes || [] : []
    const realBookedTimes = realBookings
      .filter((booking: any) => booking.date === date)
      .map((booking: any) => {
        // Convert 24-hour format to 12-hour format to match our time slots
        const time = booking.startTime
        const [hours, minutes] = time.split(':').map(Number)
        
        if (hours === 9 && minutes === 30) return '9:30 AM'
        if (hours === 13) return '1:00 PM' // 1:00 PM
        if (hours === 16) return '4:00 PM' // 4:00 PM
        
        // For other times, we need to check if they overlap with our slots
        const bookingStart = hours * 60 + minutes
        const bookingEnd = bookingStart + booking.duration
        
        // Check overlap with our predefined slots
        if (bookingStart <= 570 && bookingEnd > 570) return '9:30 AM' // 9:30 AM = 570 minutes
        if (bookingStart <= 780 && bookingEnd > 780) return '1:00 PM' // 1:00 PM = 780 minutes  
        if (bookingStart <= 960 && bookingEnd > 960) return '4:00 PM' // 4:00 PM = 960 minutes
        
        return null
      })
      .filter(Boolean)
    
    return timeSlots.filter(time => {
      // Check if time slot is blocked by manual availability settings
      const isBlockedByAvailability = !isTimeSlotAvailable(instructorId, date, time)
      // Check if time slot is already booked for supervision
      const isBookedForSupervision = bookedTimes.includes(time)
      // Check if time slot is booked for regular client appointments
      const isBookedForClients = realBookedTimes.includes(time)
      
      return !isBlockedByAvailability && !isBookedForSupervision && !isBookedForClients
    })
  }

  // Handle instructor selection
  const handleInstructorSelect = (instructorId: string) => {
    setSelectedInstructor(instructorId)
    setSelectedDate('')
    setSelectedTime('')
    setAvailableSlots([])
    
    // Fetch instructor bookings when instructor is selected
    const instructor = mockInstructors.find(i => i.id === instructorId)
    if (instructor?.email) {
      fetchInstructorBookings(instructor.email)
    }
  }

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
    
    // Fetch instructor bookings for specific date when date is selected
    const instructor = mockInstructors.find(i => i.id === selectedInstructor)
    if (instructor?.email) {
      fetchInstructorBookings(instructor.email, date)
    }
    
    if (selectedInstructor) {
      const slots = getAvailableSlots(selectedInstructor, date)
      setAvailableSlots(slots)
    }
  }

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  // Handle procedure form input changes
  const handleProcedureFormChange = (field: string, value: string) => {
    setProcedureForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle procedure logging
  const handleLogProcedure = () => {
    // Validate required fields
    if (!procedureForm.clientName || !procedureForm.clientDOB || !procedureForm.procedureDate || 
        !procedureForm.procedureType || !procedureForm.supervisorName || !procedureForm.supervisorLicense) {
      alert('Please fill in all required fields')
      return
    }

    // Create new procedure record
    const newProcedure = {
      id: Date.now().toString(),
      clientName: procedureForm.clientName,
      clientDOB: procedureForm.clientDOB,
      procedureDate: procedureForm.procedureDate,
      procedureType: procedureForm.procedureType,
      supervisorName: procedureForm.supervisorName,
      supervisorLicense: procedureForm.supervisorLicense,
      procedureNotes: procedureForm.procedureNotes,
      loggedBy: currentUser?.name || 'Unknown',
      loggedAt: new Date().toISOString(),
      status: 'completed'
    }

    // Add to procedures list
    const updatedProcedures = [...loggedProcedures, newProcedure]
    setLoggedProcedures(updatedProcedures)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('logged-procedures', JSON.stringify(updatedProcedures))
    }

    // Reset form
    setProcedureForm({
      clientName: '',
      clientDOB: '',
      procedureDate: '',
      procedureType: '',
      supervisorName: '',
      supervisorLicense: '',
      procedureNotes: ''
    })

    alert('Procedure logged successfully!')
  }

  // Export procedures to CSV
  const exportToCSV = () => {
    if (loggedProcedures.length === 0) {
      alert('No procedures to export')
      return
    }

    const headers = [
      'Procedure #',
      'Client Name',
      'Client DOB',
      'Procedure Type',
      'Procedure Date',
      'Supervisor Name',
      'Supervisor License #',
      'Procedure Notes',
      'Logged By',
      'Logged Date'
    ]

    const csvData = loggedProcedures.map((procedure, index) => [
      index + 1,
      procedure.clientName,
      new Date(procedure.clientDOB).toLocaleDateString(),
      procedure.procedureType.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      new Date(procedure.procedureDate).toLocaleDateString(),
      procedure.supervisorName.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      procedure.supervisorLicense,
      procedure.procedureNotes || '',
      procedure.loggedBy,
      new Date(procedure.loggedAt).toLocaleDateString()
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `supervised-procedures-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    alert('CSV file downloaded successfully!')
  }

  // Generate license report
  const generateLicenseReport = () => {
    if (loggedProcedures.length === 0) {
      alert('No procedures to generate report')
      return
    }

    const reportData = {
      apprenticeName: currentUser?.name || 'Unknown',
      totalProcedures: loggedProcedures.length,
      dateRange: {
        start: new Date(Math.min(...loggedProcedures.map(p => new Date(p.procedureDate).getTime()))).toLocaleDateString(),
        end: new Date(Math.max(...loggedProcedures.map(p => new Date(p.procedureDate).getTime()))).toLocaleDateString()
      },
      procedureTypes: [...new Set(loggedProcedures.map(p => p.procedureType))],
      supervisors: [...new Set(loggedProcedures.map(p => p.supervisorName))],
      procedures: loggedProcedures.map((procedure, index) => ({
        procedureNumber: index + 1,
        clientName: procedure.clientName,
        clientDOB: new Date(procedure.clientDOB).toLocaleDateString(),
        procedureType: procedure.procedureType.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        procedureDate: new Date(procedure.procedureDate).toLocaleDateString(),
        supervisorName: procedure.supervisorName.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        supervisorLicense: procedure.supervisorLicense,
        notes: procedure.procedureNotes || 'None'
      })),
      generatedDate: new Date().toLocaleDateString(),
      readyForLicense: loggedProcedures.length >= 50
    }

    const reportContent = `
SUPERVISED PROCEDURE TRAINING REPORT
Generated: ${reportData.generatedDate}

APPRENTICE INFORMATION:
Name: ${reportData.apprenticeName}
Total Procedures Completed: ${reportData.totalProcedures}
Training Period: ${reportData.dateRange.start} - ${reportData.dateRange.end}
License Ready: ${reportData.readyForLicense ? 'YES' : 'NO (Need ' + (50 - reportData.totalProcedures) + ' more procedures)'}

PROCEDURE BREAKDOWN:
${reportData.procedureTypes.map(type => `- ${type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`).join('\n')}

SUPERVISORS:
${reportData.supervisors.map(supervisor => `- ${supervisor.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`).join('\n')}

DETAILED PROCEDURE RECORDS:
${reportData.procedures.map(proc => `
Procedure #${proc.procedureNumber}
Client: ${proc.clientName}
DOB: ${proc.clientDOB}
Procedure: ${proc.procedureType}
Date: ${proc.procedureDate}
Supervisor: ${proc.supervisorName}
License #: ${proc.supervisorLicense}
Notes: ${proc.notes}
`).join('\n---\n')}

This report certifies that the above apprentice has completed ${reportData.totalProcedures} supervised procedures under licensed supervisors.
${reportData.readyForLicense ? 'The apprentice meets the minimum requirement for license application.' : 'The apprentice needs ' + (50 - reportData.totalProcedures) + ' more procedures to meet license requirements.'}
`

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `license-training-report-${new Date().toISOString().split('T')[0]}.txt`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    alert('License training report generated successfully!')
  }

  // Handle opening message composer
  const handleMessageInstructor = (instructorId: string) => {
    console.log('Message button clicked for instructor:', instructorId)
    const instructor = mockInstructors.find(i => i.id === instructorId)
    if (instructor) {
      console.log('Found instructor:', instructor.name)
      setSelectedInstructorForMessage(instructorId)
      setNewMessage({
        to: instructor.name,
        subject: '',
        content: ''
      })
      setShowMessageComposer(true)
      console.log('Message composer should be open now')
    } else {
      console.log('Instructor not found!')
    }
  }

  // Handle opening availability manager
  const handleManageAvailability = (instructorId: string) => {
    const instructor = mockInstructors.find(i => i.id === instructorId)
    if (instructor) {
      setSelectedInstructorForAvailability(instructorId)
      setNewAvailability({
        date: '',
        timeSlots: [],
        isBlocked: false,
        reason: ''
      })
      setShowAvailabilityManager(true)
    }
  }

  // Handle saving availability
  const handleSaveAvailability = () => {
    if (!newAvailability.date || newAvailability.timeSlots.length === 0) {
      alert('Please select a date and at least one time slot')
      return
    }

    if (!currentUser?.id) {
      alert('User not found. Please refresh and try again.')
      return
    }

    const availabilityKey = `${currentUser.id}-${newAvailability.date}`
    const updatedAvailability = {
      ...instructorAvailability,
      [availabilityKey]: {
        instructorId: currentUser.id,
        date: newAvailability.date,
        timeSlots: newAvailability.timeSlots,
        isBlocked: true,
        reason: newAvailability.reason,
        createdAt: new Date().toISOString()
      }
    }

    setInstructorAvailability(updatedAvailability)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('instructor-availability', JSON.stringify(updatedAvailability))
    }

    // Reset form
    setNewAvailability({
      date: '',
      timeSlots: [],
      isBlocked: false,
      reason: ''
    })

    alert('Time slots blocked successfully!')
  }

  // Check if a time slot is available for an instructor
  const isTimeSlotAvailable = (instructorId: string, date: string, timeSlot: string) => {
    const availabilityKey = `${instructorId}-${date}`
    const availability = instructorAvailability[availabilityKey]
    
    if (!availability) return true // No restrictions
    
    // Check if this specific time slot is blocked
    if (availability.timeSlots.includes(timeSlot)) {
      return false // Blocked
    }
    
    return true // Available
  }

  // Handle sending a message
  const handleSendMessage = () => {
    if (!newMessage.subject || !newMessage.content) {
      alert('Please fill in both subject and message content')
      return
    }

    const message = {
      id: Date.now().toString(),
      from: currentUser?.name || 'Unknown',
      fromEmail: currentUser?.email || '',
      to: newMessage.to,
      toId: selectedInstructorForMessage,
      subject: newMessage.subject,
      content: newMessage.content,
      sentAt: new Date().toISOString(),
      read: false,
      type: 'sent'
    }

    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('supervision-messages', JSON.stringify(updatedMessages))
    }

    // Reset form and close composer
    setNewMessage({ to: '', subject: '', content: '' })
    setShowMessageComposer(false)
    setSelectedInstructorForMessage('')

    alert('Message sent successfully!')
  }

  // Handle replying to a message
  const handleReplyMessage = (originalMessage: any) => {
    setSelectedInstructorForMessage(originalMessage.fromId || originalMessage.toId)
    setNewMessage({
      to: originalMessage.from,
      subject: `Re: ${originalMessage.subject}`,
      content: ''
    })
    setShowMessageComposer(true)
  }

  // Handle initial booking submission (shows client form)
  const handleBookingSubmit = () => {
    if (selectedInstructor && selectedDate && selectedTime) {
      setShowClientForm(true)
    }
  }

  // Handle client form submission and deposit generation
  const handleClientFormSubmit = async () => {
    if (!clientInfo.name || !clientInfo.phone || !clientInfo.service) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const instructor = mockInstructors.find(i => i.id === selectedInstructor)
      const service = (availableServices.length > 0 ? availableServices : defaultSupervisionServices).find((s: any) => s.id === clientInfo.service) as any
      
      // Create booking with pending status
      const newBooking: any = {
        id: Date.now().toString(),
        instructorId: selectedInstructor,
        instructorName: instructor?.name,
        date: selectedDate,
        time: selectedTime,
        apprenticeName: currentUser?.name || 'Apprentice',
        apprenticeEmail: currentUser?.email,
        clientInfo: clientInfo,
        service: service,
        status: 'pending-deposit',
        depositSent: false,
        createdAt: new Date().toISOString(),
        type: 'supervision_booking' // Mark as supervision booking
      }

      // Also create appointment in database for booking page integration
      // Create appointment for the CURRENT USER to see on their booking page
      try {
        const userEmail = currentUser?.email || ''
        console.log('Creating appointment with current user email:', userEmail)
        console.log('Instructor data:', instructor)
        console.log('Note: Appointment will be visible to current user, not instructor')
        
        const appointmentResponse = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': userEmail
          },
          body: JSON.stringify({
            clientName: clientInfo.name,
            clientEmail: clientInfo.email,
            clientPhone: clientInfo.phone,
            service: `Supervision Session: ${service.name} with ${instructor?.name}`,
            date: selectedDate,
            time: selectedTime,
            duration: service.duration.includes('h') ? parseInt(service.duration.split('h')[0]) * 60 : 120,
            price: service.total,
            deposit: service.deposit,
            status: 'pending_deposit'
          })
        })

        if (appointmentResponse.ok) {
          const appointmentData = await appointmentResponse.json()
          newBooking.appointmentId = appointmentData.appointment.id
          console.log('✅ Supervision booking created in appointments:', appointmentData.appointment)
        } else {
          const errorData = await appointmentResponse.json().catch(() => ({ error: 'Unknown error' }))
          console.log('⚠️ Failed to create appointment:', errorData)
          console.log('⚠️ Response status:', appointmentResponse.status)
        }
      } catch (error) {
        console.error('Error creating appointment for supervision booking:', error)
      }

      // Save booking locally
      const updatedBookings = [...bookings, newBooking]
      setBookings(updatedBookings)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('supervision-bookings', JSON.stringify(updatedBookings))
      }

      // Create client in database
      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          const clientResponse = await fetch('/api/clients', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'x-user-email': currentUser?.email || ''
            },
            body: JSON.stringify({
              name: clientInfo.name,
              email: clientInfo.email || '',
              phone: clientInfo.phone,
              notes: `Supervision session with ${instructor?.name} - ${service?.name}`
            })
          })

          if (clientResponse.ok) {
            const dbClient = await clientResponse.json()
            
            // Generate deposit payment link
            const depositResponse = await fetch('/api/deposit-payments', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                clientId: dbClient.id,
                appointmentId: newBooking.id,
                amount: (service as any)?.deposit || 150,
                totalAmount: (service as any)?.total || 400,
                currency: 'USD',
                notes: `Supervision session deposit - ${service?.name} with ${instructor?.name}`,
                linkExpirationDays: 7
              })
            })

            if (depositResponse.ok) {
              const depositData = await depositResponse.json()
              
              // Update booking with deposit link
              newBooking.depositLink = depositData.depositLink
              newBooking.depositSent = true
              newBooking.status = 'deposit-sent'
              
              // Update local storage
              const updatedBookingsWithDeposit = bookings.map(b => 
                b.id === newBooking.id ? newBooking : b
              )
              setBookings(updatedBookingsWithDeposit)
              localStorage.setItem('supervision-bookings', JSON.stringify(updatedBookingsWithDeposit))
              
              setBookingStatus('deposit-sent')
              
              alert(`Booking created! Deposit link has been sent to ${clientInfo.email || 'the client'}. Check the booking details for the deposit link.`)
            } else {
              console.error('Failed to create deposit payment')
              alert('Booking created but failed to generate deposit link. Please contact support.')
            }
          }
        } catch (error) {
          console.error('Error creating client or deposit:', error)
          alert('Booking created but there was an error with client setup. Please contact support.')
        }
      }

      // Reset form
      setSelectedInstructor('')
      setSelectedDate('')
      setSelectedTime('')
      setAvailableSlots([])
      setShowClientForm(false)
      setClientInfo({ name: '', phone: '', email: '', service: '' })
      setBookingStatus('pending')

    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking. Please try again.')
    }
  }

  // Generate calendar grid for current month
  const generateCalendarGrid = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const firstDayWeekday = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()
    
    const calendar = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      calendar.push({ type: 'empty', date: null })
    }
    
    // Add all days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const dateString = date.toISOString().split('T')[0]
      const isPast = date < today
      const isToday = date.toDateString() === today.toDateString()
      
      calendar.push({
        type: 'day',
        date: dateString,
        day: day,
        isPast: isPast,
        isToday: isToday,
        display: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      })
    }
    
    return calendar
  }

  // Get month name for header
  const getMonthName = () => {
    const today = new Date()
    return today.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender"></div>
      </div>
    )
  }

  // Feature gate for Enterprise Studio subscribers
  if (!supervisionAccess?.isEnterpriseStudio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-beige/20 to-ivory flex items-center justify-center p-4">
        <FeatureAccessGate 
          feature={FEATURES.ENTERPRISE_STUDIO.SUPERVISION_SCHEDULING}
          userPlan={(currentUser?.subscription === 'studio' ? 'studio' : 'basic') as any}
          children={null}
        />
      </div>
    )
  }

  // Check if user should have access to supervision booking
  const userData = {
    id: currentUser?.id || '',
    email: currentUser?.email || '',
    role: currentUser?.role || 'artist',
    selectedPlan: (currentUser as any)?.selectedPlan || currentUser?.subscription || 'starter',
    isLicenseVerified: (currentUser as any)?.isLicenseVerified || false,
    hasActiveSubscription: (currentUser as any)?.hasActiveSubscription || false
  }

  const canUseSupervisionBooking = shouldUseSupervisionBooking(userData)
  const isInstructor = supervisionAccess?.userRole === 'INSTRUCTOR'

  // Show access denied message for licensed artists (unless they're instructors)
  if (!canUseSupervisionBooking && !isInstructor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-beige/20 to-ivory">
        <NavBar 
          currentPath="/studio/supervision"
          user={currentUser ? {
            name: currentUser.name,
            email: currentUser.email,
            avatar: (currentUser as any).avatar
          } : undefined}
        />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-ink mb-4">Access Restricted</h1>
            <p className="text-ink/70 mb-6">
              As a licensed artist, you should use the regular booking system for your client appointments.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-ink/60">
                <strong>Licensed artists should:</strong>
              </p>
              <ul className="text-sm text-ink/60 space-y-1 text-left">
                <li>• Work independently with clients</li>
                <li>• Use the regular booking system</li>
                <li>• Manage their own appointment calendar</li>
              </ul>
            </div>
            <Button 
              onClick={() => router.push('/booking')}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Go to Regular Booking
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-beige/30 to-ivory">
      {/* Navigation Header */}
      <NavBar 
        currentPath="/studio/supervision"
        user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase(),
          avatar: undefined
        } : undefined}
      />

      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-lavender/30 to-lavender/10 border-b border-lavender/40">
        <div className="absolute inset-0 bg-gradient-to-r from-lavender/10 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-lavender to-lavender-600 rounded-full flex items-center justify-center shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
            <div>
                <h1 className="text-3xl font-bold text-ink">Instructor Booking</h1>
                <p className="text-ink/70 mt-1 font-medium">Book supervision sessions with certified instructors</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Badge variant="outline" className="bg-lavender/20 text-ink border-lavender shadow-sm">
                  <Shield className="h-3 w-3 mr-1" />
                  Studio Enterprise
                </Badge>
              <Badge variant="outline" className="bg-white/80 text-ink/80 border-lavender/50 shadow-sm">
                  <Users className="h-3 w-3 mr-1" />
                  {userRole === 'INSTRUCTOR' && 'Supervisor Access'}
                  {userRole === 'APPRENTICE' && 'Apprentice Access'}
                  {userRole === 'ADMIN' && 'Admin Access'}
                </Badge>
              </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className={`grid w-full ${userRole === 'INSTRUCTOR' ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'} bg-white/90 backdrop-blur-sm border border-lavender/50 shadow-xl rounded-xl p-1`}>
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender data-[state=active]:to-lavender-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200 font-medium"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value={userRole === 'INSTRUCTOR' ? 'availability' : 'find'}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender data-[state=active]:to-lavender-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200 font-medium"
            >
              {userRole === 'INSTRUCTOR' ? 'My Availability' : 'Book Instructor'}
            </TabsTrigger>
            <TabsTrigger 
              value={userRole === 'INSTRUCTOR' ? 'bookings' : 'history'}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender data-[state=active]:to-lavender-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200 font-medium"
            >
              {userRole === 'INSTRUCTOR' ? 'My Bookings' : 'My History'}
            </TabsTrigger>
            <TabsTrigger 
              value="inbox"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender data-[state=active]:to-lavender-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200 font-medium"
            >
              <Users className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Inbox</span>
            </TabsTrigger>
            {/* Reports tab - Instructor only */}
            {userRole === 'INSTRUCTOR' && (
              <TabsTrigger 
                value="reports"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender data-[state=active]:to-lavender-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200 font-medium"
              >
                Reports
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="relative overflow-hidden border-lavender/50 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-lavender/20 to-white backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-lavender/30 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-bold text-ink">Training Hours</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-r from-lavender to-lavender-600 rounded-full flex items-center justify-center shadow-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-ink">24</div>
                  <p className="text-sm text-lavender-600 font-medium">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-green-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50/80 to-white backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100/50 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-bold text-green-800">Completed Procedures</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-green-900">18</div>
                  <p className="text-sm text-green-600 font-medium">
                    +8 this month
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50/80 to-white backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-bold text-blue-800">Active Bookings</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-blue-900">5</div>
                  <p className="text-sm text-blue-600 font-medium">
                    +2 this week
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-xl font-bold text-ink">Quick Actions</CardTitle>
                <CardDescription className="text-ink/70 font-medium">
                  Common actions for your role
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {userRole === 'INSTRUCTOR' && (
                    <>
                      <Button 
                        className="h-auto p-6 flex-col bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-xl"
                        onClick={() => setActiveTab('availability')}
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-lg">Set Availability</span>
                        <span className="text-white/90 text-sm mt-1">Schedule supervision blocks</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-6 flex-col border-lavender/50 bg-white/90 hover:bg-lavender/10 text-ink hover:text-ink shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                        onClick={() => setActiveTab('find')}
                      >
                        <div className="w-12 h-12 bg-lavender/20 rounded-full flex items-center justify-center mb-3">
                          <Users className="h-6 w-6 text-lavender" />
                        </div>
                        <span className="font-bold text-lg">Review Bookings</span>
                        <span className="text-ink/70 text-sm mt-1">Manage apprentice sessions</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-6 flex-col border-lavender/50 bg-white/90 hover:bg-lavender/10 text-ink hover:text-ink shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                        onClick={() => setActiveTab('history')}
                      >
                        <div className="w-12 h-12 bg-lavender/20 rounded-full flex items-center justify-center mb-3">
                          <CheckCircle className="h-6 w-6 text-lavender" />
                        </div>
                        <span className="font-bold text-lg">Log Procedures</span>
                        <span className="text-ink/70 text-sm mt-1">Track completed work</span>
                      </Button>
                    </>
                  )}

                  {userRole === 'APPRENTICE' && (
                    <>
                      <Button 
                        className="h-auto p-6 flex-col bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-xl"
                        onClick={() => setActiveTab('find')}
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-lg">Book Session</span>
                        <span className="text-blue-100 text-sm mt-1">Find available supervisors</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-6 flex-col border-blue-200/50 bg-white/90 hover:bg-blue-50/80 text-blue-700 hover:text-blue-800 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                        onClick={() => setActiveTab('history')}
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                          <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="font-bold text-lg">View History</span>
                        <span className="text-blue-600 text-sm mt-1">Past training sessions</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-6 flex-col border-blue-200/50 bg-white/90 hover:bg-blue-50/80 text-blue-700 hover:text-blue-800 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                        onClick={() => setActiveTab('reports')}
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                          <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="font-bold text-lg">Track Progress</span>
                        <span className="text-blue-600 text-sm mt-1">Monitor development</span>
                      </Button>
                    </>
                  )}

                  {userRole === 'ADMIN' && (
                    <>
                      <Button 
                        className="h-auto p-6 flex-col bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-xl"
                        onClick={() => router.push('/studio/supervision/overview')}
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                          <BarChart3 className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-lg">Studio Overview</span>
                        <span className="text-emerald-100 text-sm mt-1">Complete system analytics</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-6 flex-col border-emerald-200/50 bg-white/90 hover:bg-emerald-50/80 text-emerald-700 hover:text-emerald-800 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                        onClick={() => router.push('/studio/supervision/reports')}
                      >
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                          <Clock className="h-6 w-6 text-emerald-600" />
                        </div>
                        <span className="font-bold text-lg">Export Reports</span>
                        <span className="text-emerald-600 text-sm mt-1">Generate compliance data</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-6 flex-col border-emerald-200/50 bg-white/90 hover:bg-emerald-50/80 text-emerald-700 hover:text-emerald-800 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                        onClick={() => router.push('/enterprise/staff')}
                      >
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                          <Users className="h-6 w-6 text-emerald-600" />
                        </div>
                        <span className="font-bold text-lg">Manage Team</span>
                        <span className="text-emerald-600 text-sm mt-1">Staff & permissions</span>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Coming Soon Placeholders */}
          <TabsContent value="availability">
            <div className="space-y-6">
              {/* Current Client Bookings */}
              <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl font-bold text-ink flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-lavender" />
                    My Client Bookings
                  </CardTitle>
                  <CardDescription className="text-ink/70 font-medium">
                    Your scheduled client appointments automatically block supervision times
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  {currentUser?.email && instructorBookings[currentUser.email] ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-green-800">Real-time Integration Active</p>
                            <p className="text-sm text-green-600">
                              {instructorBookings[currentUser.email].totalAppointments} client appointments synced
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            const instructor = mockInstructors.find(i => i.email === currentUser.email)
                            if (instructor?.email) {
                              fetchInstructorBookings(instructor.email)
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-700 hover:bg-green-100"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Refresh
                        </Button>
                      </div>
                      
                      <div className="grid gap-3">
                        {instructorBookings[currentUser.email].blockedTimes.length > 0 ? (
                          instructorBookings[currentUser.email].blockedTimes.slice(0, 5).map((booking: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white border border-lavender/30 rounded-lg">
                              <div>
                                <p className="font-medium text-ink">{booking.clientName}</p>
                                <p className="text-sm text-ink/70">{booking.service}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-ink">{booking.date}</p>
                                <p className="text-sm text-ink/70">{booking.startTime} - {booking.endTime}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No client bookings found</p>
                            <p className="text-sm text-gray-500">Your client appointments will appear here</p>
                          </div>
                        )}
                      </div>
                      
                      {instructorBookings[currentUser.email].blockedTimes.length > 5 && (
                        <p className="text-sm text-ink/70 text-center">
                          Showing 5 of {instructorBookings[currentUser.email].blockedTimes.length} appointments
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Loading your bookings...</p>
                      <Button
                        onClick={() => {
                          if (currentUser?.email) {
                            fetchInstructorBookings(currentUser.email)
                          }
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Load Bookings
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Manual Availability Settings */}
              <Card className="relative overflow-hidden border-green-500/50 shadow-2xl bg-gradient-to-br from-white/95 to-green-50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl font-bold text-ink flex items-center gap-3">
                    <Clock className="h-6 w-6 text-green-600" />
                    Block Time Slots
                  </CardTitle>
                  <CardDescription className="text-ink/70 font-medium">
                    Block specific time slots for personal reasons, breaks, or other commitments
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-6">
                    {/* Block Time Form */}
                    <div className="bg-white border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-ink mb-4">Block a Time Slot</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label htmlFor="block-date" className="text-ink font-medium">Date</Label>
                          <Input
                            id="block-date"
                            type="date"
                            value={newAvailability.date}
                            onChange={(e) => setNewAvailability({
                              ...newAvailability,
                              date: e.target.value
                            })}
                            className="mt-1"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-ink font-medium">Time Slots</Label>
                          <div className="mt-1 space-y-2">
                            {['9:30 AM', '1:00 PM', '4:00 PM'].map((slot) => (
                              <div key={slot} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`slot-${slot}`}
                                  checked={newAvailability.timeSlots.includes(slot)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewAvailability({
                                        ...newAvailability,
                                        timeSlots: [...newAvailability.timeSlots, slot]
                                      })
                                    } else {
                                      setNewAvailability({
                                        ...newAvailability,
                                        timeSlots: newAvailability.timeSlots.filter(t => t !== slot)
                                      })
                                    }
                                  }}
                                  className="rounded border-green-300 text-green-600 focus:ring-green-500"
                                />
                                <Label htmlFor={`slot-${slot}`} className="text-sm text-ink">
                                  {slot}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <Label htmlFor="block-reason" className="text-ink font-medium">Reason (Optional)</Label>
                        <Input
                          id="block-reason"
                          type="text"
                          placeholder="e.g., Personal break, Training session, etc."
                          value={newAvailability.reason}
                          onChange={(e) => setNewAvailability({
                            ...newAvailability,
                            reason: e.target.value
                          })}
                          className="mt-1"
                        />
                      </div>
                      
                      <Button
                        onClick={handleSaveAvailability}
                        disabled={!newAvailability.date || newAvailability.timeSlots.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Block Selected Times
                      </Button>
                    </div>

                    {/* Current Blocks */}
                    <div>
                      <h3 className="text-lg font-semibold text-ink mb-4">Current Time Blocks</h3>
                      
                      {Object.keys(instructorAvailability).length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(instructorAvailability)
                            .filter(([key]) => key.startsWith(currentUser?.id || ''))
                            .map(([key, availability]: [string, any]) => (
                              <div key={key} className="flex items-center justify-between p-4 bg-white border border-green-200 rounded-lg">
                                <div>
                                  <p className="font-medium text-ink">
                                    {new Date(availability.date).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-ink/70">
                                    {availability.timeSlots.join(', ')}
                                  </p>
                                  {availability.reason && (
                                    <p className="text-sm text-green-600 mt-1">
                                      {availability.reason}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    const updatedAvailability = { ...instructorAvailability }
                                    delete updatedAvailability[key]
                                    setInstructorAvailability(updatedAvailability)
                                    
                                    if (typeof window !== 'undefined') {
                                      localStorage.setItem('instructor-availability', JSON.stringify(updatedAvailability))
                                    }
                                  }}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-white border border-green-200 rounded-lg">
                          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">No time blocks set</p>
                          <p className="text-sm text-gray-500">Block time slots above to prevent bookings</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                      <Info className="h-4 w-4" />
                      <span>Manual blocks work alongside your client bookings</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="find">
            <div className="space-y-6">

              {/* Instructor Selection */}
                <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
                      <Users className="h-6 w-6 text-lavender" />
                      Select Your Instructor
                    </CardTitle>
                    <CardDescription className="text-ink/70 font-medium">
                      Choose from our certified PMU instructors
                    </CardDescription>
              </CardHeader>
                <CardContent className="relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mockInstructors.map((instructor) => (
                      <Card 
                        key={instructor.id}
                        className={`transition-all duration-300 border-2 ${
                          selectedInstructor === instructor.id 
                            ? 'border-lavender bg-lavender/10 shadow-lg' 
                            : 'border-gray-200 hover:border-lavender/50 hover:shadow-md'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-lavender to-lavender-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {instructor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h3 className="font-bold text-ink">{instructor.name}</h3>
                              <p className="text-sm text-ink/70">{instructor.specialty}</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-ink/70">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span>{instructor.rating} ({instructor.experience})</span>
                            </div>
                            <div className="flex items-center gap-2 text-ink/70">
                              <MapPin className="h-4 w-4 text-lavender" />
                              <span>{instructor.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-ink/70">
                              <Users className="h-4 w-4 text-lavender" />
                              <span>Available for supervision</span>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleInstructorSelect(instructor.id)
                              }}
                              variant={selectedInstructor === instructor.id ? "default" : "outline"}
                              className={`flex-1 ${
                                selectedInstructor === instructor.id 
                                  ? 'bg-gradient-to-r from-lavender to-lavender-600 text-white' 
                                  : 'border-lavender/50 hover:bg-lavender/10'
                              }`}
                            >
                              {selectedInstructor === instructor.id ? 'Selected' : 'Select'}
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMessageInstructor(instructor.id)
                              }}
                              variant="outline"
                              size="sm"
                              className="border-lavender/50 hover:bg-lavender/10"
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          </div>
                          {userRole === 'INSTRUCTOR' && instructor.id === currentUser?.id && (
                            <div className="mt-2">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleManageAvailability(instructor.id)
                                }}
                                variant="outline"
                                size="sm"
                                className="w-full border-green-500/50 hover:bg-green-50 text-green-700"
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Manage Availability
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Date and Time Selection */}
              {selectedInstructor && (
                <>
                  {/* Date Selection */}
                  <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                    <CardHeader className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
                            <Calendar className="h-6 w-6 text-lavender" />
                            Select Date
                          </CardTitle>
                          <CardDescription className="text-ink/70 font-medium">
                            Click on any available date to book your supervision session
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="bg-white/80 rounded-xl p-4 border border-lavender/30">
                        {/* Calendar Header */}
                        <div className="text-center mb-4">
                          <h3 className="text-xl font-bold text-ink">{getMonthName()}</h3>
                        </div>
                        
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="text-center text-sm font-medium text-ink/60 py-2">
                              {day}
                            </div>
                          ))}
                        </div>
                        
                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {generateCalendarGrid().map((dayInfo, index) => {
                            if (dayInfo.type === 'empty') {
                              return <div key={index} className="h-10"></div>
                            }
                            
                            const isSelected = selectedDate === dayInfo.date
                            const isDisabled = dayInfo.isPast
                            
                            return (
                              <Button
                                key={dayInfo.date}
                                variant="ghost"
                                disabled={isDisabled}
                                className={`h-10 p-0 text-sm font-medium relative ${
                                  isSelected 
                                    ? 'bg-lavender text-white hover:bg-lavender-600 shadow-lg' 
                                    : isDisabled
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : dayInfo.isToday
                                    ? 'bg-lavender/20 text-ink hover:bg-lavender/30 border border-lavender/50'
                                    : 'text-ink hover:bg-lavender/20 hover:text-ink'
                                }`}
                                onClick={() => !isDisabled && dayInfo.date && handleDateSelect(dayInfo.date)}
                              >
                                <span>{dayInfo.day}</span>
                                {dayInfo.isToday && !isSelected && (
                                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-lavender rounded-full"></div>
                                )}
                              </Button>
                            )
                          })}
                        </div>
                        
                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-ink/60">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-lavender/20 border border-lavender/50 rounded"></div>
                            <span>Today</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-lavender rounded"></div>
                            <span>Selected</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-200 rounded"></div>
                            <span>Unavailable</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Time Selection */}
                  {selectedDate && (
                    <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                      <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                      <CardHeader className="relative z-10">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
                              <Clock className="h-6 w-6 text-lavender" />
                              Select Time Slot
                            </CardTitle>
                            <CardDescription className="text-ink/70 font-medium">
                              Available supervision sessions for {new Date(selectedDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        {availableSlots.length > 0 ? (
                          <div className="bg-white/80 rounded-xl p-6 border border-lavender/30">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {availableSlots.map((time) => (
                                <Button
                                  key={time}
                                  variant={selectedTime === time ? "default" : "outline"}
                                  className={`h-20 text-xl font-bold flex flex-col gap-2 transition-all duration-300 ${
                                    selectedTime === time 
                                      ? 'bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white shadow-lg' 
                                      : 'hover:bg-lavender/10 hover:border-lavender/50 hover:shadow-md border-lavender/30'
                                  }`}
                                  onClick={() => handleTimeSelect(time)}
                                >
                                  <Clock className="h-6 w-6" />
                                  <span>{time}</span>
                                  <span className="text-sm font-normal opacity-80">2 hours</span>
                                </Button>
                              ))}
                            </div>
                            
                            {selectedTime && (
                              <div className="mt-6 p-4 bg-lavender/10 rounded-lg border border-lavender/30">
                                <div className="flex items-center gap-2 text-lavender">
                                  <CheckCircle className="h-5 w-5" />
                                  <span className="font-medium">Time Selected: {selectedTime}</span>
                                </div>
                                <p className="text-sm text-ink/70 mt-1">
                                  Session duration: 2 hours • Perfect for comprehensive supervision
                  </p>
                </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-white/80 rounded-xl border border-lavender/30">
                            <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-ink mb-2">No Available Time Slots</h3>
                            <p className="text-ink/70 text-lg mb-4">All supervision sessions are booked for this date</p>
                            <p className="text-ink/50 text-sm">Please select a different date or try another instructor</p>
                          </div>
                        )}
              </CardContent>
            </Card>
                  )}

                  {/* Booking Confirmation */}
                  {selectedInstructor && selectedDate && selectedTime && !showClientForm && (
                    <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                      <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                      <CardHeader className="relative z-10">
                        <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                          Confirm Booking
                        </CardTitle>
                        <CardDescription className="text-ink/70 font-medium">
                          Review your supervision session details
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="bg-white/80 rounded-xl p-6 border border-lavender/30">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-ink">Instructor:</span>
                              <span className="text-ink/80">{mockInstructors.find(i => i.id === selectedInstructor)?.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-ink">Date:</span>
                              <span className="text-ink/80">{new Date(selectedDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-ink">Time:</span>
                              <span className="text-ink/80">{selectedTime}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-ink">Duration:</span>
                              <span className="text-ink/80">2 hours</span>
                            </div>
                          </div>
                          <div className="mt-6 pt-4 border-t border-lavender/30">
                            <Button 
                              onClick={handleBookingSubmit}
                              className="w-full bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Users className="h-5 w-5 mr-2" />
                              Continue to Client Information
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Client Information Form */}
                  {showClientForm && (
                    <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                      <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                      <CardHeader className="relative z-10">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
                              <Users className="h-6 w-6 text-lavender" />
                              Client Information
                            </CardTitle>
                            <CardDescription className="text-ink/70 font-medium">
                              Enter client details and select the service for this supervision session
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="bg-white/80 rounded-xl p-6 border border-lavender/30 space-y-6">
                          {/* Session Summary */}
                          <div className="bg-lavender/10 rounded-lg p-4 border border-lavender/30">
                            <h3 className="font-bold text-ink mb-2">Session Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div><span className="font-medium">Instructor:</span> {mockInstructors.find(i => i.id === selectedInstructor)?.name}</div>
                              <div><span className="font-medium">Date:</span> {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                              <div><span className="font-medium">Time:</span> {selectedTime}</div>
                              <div><span className="font-medium">Duration:</span> 2 hours</div>
                            </div>
                          </div>

                          {/* Client Form */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-ink mb-2">Client Name *</label>
                              <input
                                type="text"
                                value={clientInfo.name}
                                onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                                className="w-full p-3 border border-lavender/30 rounded-lg focus:ring-2 focus:ring-lavender/50 focus:border-lavender"
                                placeholder="Enter client's full name"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-ink mb-2">Phone Number *</label>
                              <input
                                type="tel"
                                value={clientInfo.phone}
                                onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                                className="w-full p-3 border border-lavender/30 rounded-lg focus:ring-2 focus:ring-lavender/50 focus:border-lavender"
                                placeholder="(555) 123-4567"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-ink mb-2">Email Address</label>
                              <input
                                type="email"
                                value={clientInfo.email}
                                onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                                className="w-full p-3 border border-lavender/30 rounded-lg focus:ring-2 focus:ring-lavender/50 focus:border-lavender"
                                placeholder="client@example.com"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-ink mb-2">Service *</label>
                              <select
                                value={clientInfo.service}
                                onChange={(e) => setClientInfo({...clientInfo, service: e.target.value})}
                                className="w-full p-3 border border-lavender/30 rounded-lg focus:ring-2 focus:ring-lavender/50 focus:border-lavender"
                                required
                              >
                                <option value="">Select a service</option>
                                {(availableServices.length > 0 ? availableServices : defaultSupervisionServices).map((service: any) => (
                                  <option key={service.id} value={service.id}>
                                    {service.name} - ${service.total} (${service.deposit} deposit)
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Selected Service Details */}
                          {clientInfo.service && (
                            <div className="bg-lavender/10 rounded-lg p-4 border border-lavender/30">
                              <h3 className="font-bold text-ink mb-2">Service Details</h3>
                              {(() => {
                                const service = (availableServices.length > 0 ? availableServices : defaultSupervisionServices).find((s: any) => s.id === clientInfo.service) as any
                                return service ? (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Service:</span><br/>
                                      {service.name}
                                    </div>
                                    <div>
                                      <span className="font-medium">Total Cost:</span><br/>
                                      ${(service as any).total}
                                    </div>
                                    <div>
                                      <span className="font-medium">Deposit Required:</span><br/>
                                      ${(service as any).deposit}
                                    </div>
                                  </div>
                                ) : null
                              })()}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-4 pt-4 border-t border-lavender/30">
                            <Button 
                              onClick={() => setShowClientForm(false)}
                              variant="outline"
                              className="flex-1 border-lavender/50 hover:bg-lavender/10"
                            >
                              Back to Details
                            </Button>
                            <Button 
                              onClick={handleClientFormSubmit}
                              disabled={!clientInfo.name || !clientInfo.phone || !clientInfo.service}
                              className="flex-1 bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <div className="flex flex-col items-center">
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  <span className="text-sm font-medium">Create Booking</span>
                                </div>
                                <span className="text-xs opacity-90">Send Deposit Link</span>
                              </div>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <div className="space-y-6">
              {/* Supervision Bookings */}
              <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl font-bold text-ink flex items-center gap-3">
                    <GraduationCap className="h-6 w-6 text-lavender" />
                    Supervision Sessions
                  </CardTitle>
                  <CardDescription className="text-ink/70 font-medium">
                    Manage your apprentice supervision bookings
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    {bookings.filter(booking => booking.instructorId === currentUser?.id).length > 0 ? (
                      bookings
                        .filter(booking => booking.instructorId === currentUser?.id)
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 bg-white border border-lavender/30 rounded-lg shadow-sm">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-lavender/20 rounded-full flex items-center justify-center">
                                  <Users className="h-4 w-4 text-lavender" />
                                </div>
                                <div>
                                  <p className="font-semibold text-ink">{booking.clientName}</p>
                                  <p className="text-sm text-ink/70">Apprentice Session</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-ink/70">
                                <div>
                                  <span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">Time:</span> {booking.time}
                                </div>
                                <div>
                                  <span className="font-medium">Service:</span> {booking.service}
                                </div>
                                <div>
                                  <span className="font-medium">Status:</span> 
                                  <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="ml-1">
                                    {booking.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  if (confirm('Are you sure you want to cancel this supervision session?')) {
                                    const updatedBookings = bookings.filter(b => b.id !== booking.id)
                                    setBookings(updatedBookings)
                                    if (typeof window !== 'undefined') {
                                      localStorage.setItem('supervision-bookings', JSON.stringify(updatedBookings))
                                    }
                                  }
                                }}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="bg-lavender hover:bg-lavender-600 text-white"
                                onClick={() => {
                                  // Navigate to POS with pre-filled supervision session
                                  const posUrl = `/pos?supervision=${encodeURIComponent(JSON.stringify({
                                    clientName: booking.clientName,
                                    clientEmail: booking.clientEmail,
                                    clientPhone: booking.clientPhone,
                                    service: booking.service,
                                    deposit: booking.deposit,
                                    total: booking.total
                                  }))}`
                                  window.open(posUrl, '_blank')
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Checkout
                              </Button>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8">
                        <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">No supervision sessions scheduled</p>
                        <p className="text-sm text-gray-500">Apprentice bookings will appear here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Client Appointments */}
              <Card className="relative overflow-hidden border-green-500/50 shadow-2xl bg-gradient-to-br from-white/95 to-green-50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl font-bold text-ink flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-green-600" />
                    Client Appointments
                  </CardTitle>
                  <CardDescription className="text-ink/70 font-medium">
                    Manage your regular client bookings from the main booking page
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    {currentUser?.email && instructorBookings[currentUser.email]?.blockedTimes?.length > 0 ? (
                      instructorBookings[currentUser.email].blockedTimes
                        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((appointment: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-white border border-green-200 rounded-lg shadow-sm">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <Calendar className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-ink">{appointment.clientName}</p>
                                  <p className="text-sm text-ink/70">Client Appointment</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-ink/70">
                                <div>
                                  <span className="font-medium">Date:</span> {new Date(appointment.date).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">Time:</span> {appointment.startTime} - {appointment.endTime}
                                </div>
                                <div>
                                  <span className="font-medium">Service:</span> {appointment.service}
                                </div>
                                <div>
                                  <span className="font-medium">Status:</span> 
                                  <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'} className="ml-1">
                                    {appointment.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  if (confirm('Are you sure you want to cancel this client appointment?')) {
                                    // This would typically call an API to cancel the appointment
                                    alert('Appointment cancellation would be handled via the main booking system')
                                  }
                                }}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                  // Navigate to POS with pre-filled client appointment
                                  const posUrl = `/pos?appointment=${encodeURIComponent(JSON.stringify({
                                    clientName: appointment.clientName,
                                    service: appointment.service,
                                    appointmentId: appointment.id
                                  }))}`
                                  window.open(posUrl, '_blank')
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Checkout
                              </Button>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">No client appointments found</p>
                        <p className="text-sm text-gray-500">Your client bookings will appear here</p>
                        <Button
                          onClick={() => {
                            if (currentUser?.email) {
                              fetchInstructorBookings(currentUser.email)
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="mt-3"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Refresh Appointments
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="relative overflow-hidden border-blue-500/50 shadow-2xl bg-gradient-to-br from-white/95 to-blue-50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl font-bold text-ink flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-ink/70 font-medium">
                    Manage your bookings and access tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex-col border-lavender/50 bg-white/90 hover:bg-lavender/10 text-ink hover:text-ink"
                      onClick={() => window.open('/booking', '_blank')}
                    >
                      <Calendar className="h-6 w-6 mb-2 text-lavender" />
                      <span className="font-semibold">View Full Calendar</span>
                      <span className="text-xs text-ink/70">See all appointments</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex-col border-green-300 bg-white/90 hover:bg-green-50 text-ink hover:text-ink"
                      onClick={() => window.open('/pos', '_blank')}
                    >
                      <CheckCircle className="h-6 w-6 mb-2 text-green-600" />
                      <span className="font-semibold">Open POS</span>
                      <span className="text-xs text-ink/70">Process payments</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex-col border-blue-300 bg-white/90 hover:bg-blue-50 text-ink hover:text-ink"
                      onClick={() => {
                        if (currentUser?.email) {
                          fetchInstructorBookings(currentUser.email)
                        }
                      }}
                    >
                      <RefreshCw className="h-6 w-6 mb-2 text-blue-600" />
                      <span className="font-semibold">Refresh All</span>
                      <span className="text-xs text-ink/70">Sync latest bookings</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-6">
              {/* Procedure Logging Form */}
              <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-lavender" />
                    Log New Procedure
                  </CardTitle>
                  <CardDescription className="text-ink/70 font-medium">
                    Record supervised procedures for license compliance
                  </CardDescription>
              </CardHeader>
                <CardContent className="relative z-10">
                  <div className="bg-white/80 rounded-xl p-6 border border-lavender/30 space-y-6">
                    {/* Client Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-ink border-b border-lavender/30 pb-2">Client Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="clientName" className="text-ink font-medium">Client Full Name *</Label>
                          <Input
                            id="clientName"
                            placeholder="Enter client's full name"
                            value={procedureForm.clientName}
                            onChange={(e) => handleProcedureFormChange('clientName', e.target.value)}
                            className="mt-1 border-lavender/50 focus:border-lavender focus:ring-lavender/20"
                          />
                        </div>
                        <div>
                          <Label htmlFor="clientDOB" className="text-ink font-medium">Date of Birth *</Label>
                          <Input
                            id="clientDOB"
                            type="date"
                            value={procedureForm.clientDOB}
                            onChange={(e) => handleProcedureFormChange('clientDOB', e.target.value)}
                            className="mt-1 border-lavender/50 focus:border-lavender focus:ring-lavender/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Procedure Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-ink border-b border-lavender/30 pb-2">Procedure Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="procedureDate" className="text-ink font-medium">Date of Procedure *</Label>
                          <Input
                            id="procedureDate"
                            type="date"
                            value={procedureForm.procedureDate}
                            onChange={(e) => handleProcedureFormChange('procedureDate', e.target.value)}
                            className="mt-1 border-lavender/50 focus:border-lavender focus:ring-lavender/20"
                          />
                        </div>
                        <div>
                          <Label htmlFor="procedureType" className="text-ink font-medium">Procedure Type *</Label>
                          <Select value={procedureForm.procedureType} onValueChange={(value) => handleProcedureFormChange('procedureType', value)}>
                            <SelectTrigger className="mt-1 border-lavender/50 focus:border-lavender focus:ring-lavender/20">
                              <SelectValue placeholder="Select procedure type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="eyebrow-microblading">Eyebrow Microblading</SelectItem>
                              <SelectItem value="eyebrow-powder-brows">Eyebrow Powder Brows</SelectItem>
                              <SelectItem value="lip-blushing">Lip Blushing</SelectItem>
                              <SelectItem value="eyeliner">Eyeliner</SelectItem>
                              <SelectItem value="lash-enhancement">Lash Enhancement</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Supervision Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-ink border-b border-lavender/30 pb-2">Supervision Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="supervisorName" className="text-ink font-medium">Supervisor Name *</Label>
                          <Select value={procedureForm.supervisorName} onValueChange={(value) => handleProcedureFormChange('supervisorName', value)}>
                            <SelectTrigger className="mt-1 border-lavender/50 focus:border-lavender focus:ring-lavender/20">
                              <SelectValue placeholder="Select supervisor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                              <SelectItem value="michael-chen">Michael Chen</SelectItem>
                              <SelectItem value="emma-rodriguez">Emma Rodriguez</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="supervisorLicense" className="text-ink font-medium">Supervisor License # *</Label>
                          <Input
                            id="supervisorLicense"
                            placeholder="Enter supervisor's license number"
                            value={procedureForm.supervisorLicense}
                            onChange={(e) => handleProcedureFormChange('supervisorLicense', e.target.value)}
                            className="mt-1 border-lavender/50 focus:border-lavender focus:ring-lavender/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-ink border-b border-lavender/30 pb-2">Additional Information</h3>
                      <div>
                        <Label htmlFor="procedureNotes" className="text-ink font-medium">Procedure Notes</Label>
                        <textarea
                          id="procedureNotes"
                          rows={4}
                          placeholder="Any additional notes about the procedure, complications, or special circumstances..."
                          value={procedureForm.procedureNotes}
                          onChange={(e) => handleProcedureFormChange('procedureNotes', e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-lavender/50 rounded-md focus:border-lavender focus:ring-lavender/20 resize-none"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-lavender/30">
                      <Button 
                        onClick={handleLogProcedure}
                        className="w-full bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <BookOpen className="h-5 w-5 mr-2" />
                        Log Procedure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Procedure History */}
              <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-lavender" />
                    Procedure History
                  </CardTitle>
                  <CardDescription className="text-ink/70 font-medium">
                    View all logged procedures for license submission
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="bg-white/80 rounded-xl p-6 border border-lavender/30">
                    {loggedProcedures.length === 0 ? (
                <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-lavender to-lavender-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <BarChart3 className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-ink mb-2">No Procedures Logged Yet</h3>
                        <p className="text-ink/70">
                          Start logging your supervised procedures above to build your training history.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-ink">Logged Procedures ({loggedProcedures.length})</h3>
                          <Badge variant="outline" className="bg-lavender/20 text-ink border-lavender">
                            Ready for License Submission
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          {loggedProcedures.map((procedure, index) => (
                            <div key={procedure.id} className="bg-lavender/10 rounded-lg p-4 border border-lavender/30">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="font-medium text-ink">Procedure #{loggedProcedures.length - index}</span>
                                  </div>
                                  <div className="space-y-1 text-sm">
                                    <div><span className="font-medium">Client:</span> {procedure.clientName}</div>
                                    <div><span className="font-medium">DOB:</span> {new Date(procedure.clientDOB).toLocaleDateString()}</div>
                                    <div><span className="font-medium">Procedure:</span> {procedure.procedureType.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                                    <div><span className="font-medium">Date:</span> {new Date(procedure.procedureDate).toLocaleDateString()}</div>
                                  </div>
                                </div>
                                <div>
                                  <div className="space-y-1 text-sm">
                                    <div><span className="font-medium">Supervisor:</span> {procedure.supervisorName.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                                    <div><span className="font-medium">License #:</span> {procedure.supervisorLicense}</div>
                                    <div><span className="font-medium">Logged:</span> {new Date(procedure.loggedAt).toLocaleDateString()}</div>
                                    <div><span className="font-medium">By:</span> {procedure.loggedBy}</div>
                                  </div>
                                  {procedure.procedureNotes && (
                                    <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                                      <span className="font-medium">Notes:</span> {procedure.procedureNotes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              {/* Training Progress Summary */}
              <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-lavender" />
                    Training Progress Summary
                  </CardTitle>
                  <CardDescription className="text-ink/70 font-medium">
                    Overview of your supervised procedure training progress
                  </CardDescription>
              </CardHeader>
                <CardContent className="relative z-10">
                  <div className="bg-white/80 rounded-xl p-6 border border-lavender/30">
                    {loggedProcedures.length === 0 ? (
                <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-lavender to-lavender-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <BarChart3 className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-ink mb-2">No Data Available</h3>
                        <p className="text-ink/70">
                          Log some procedures to see your training progress summary.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-lavender/10 rounded-lg p-4 border border-lavender/30 text-center">
                          <div className="text-2xl font-bold text-lavender mb-1">{loggedProcedures.length}</div>
                          <div className="text-sm text-ink/70">Total Procedures</div>
                        </div>
                        <div className="bg-lavender/10 rounded-lg p-4 border border-lavender/30 text-center">
                          <div className="text-2xl font-bold text-lavender mb-1">
                            {new Set(loggedProcedures.map(p => p.procedureType)).size}
                          </div>
                          <div className="text-sm text-ink/70">Procedure Types</div>
                        </div>
                        <div className="bg-lavender/10 rounded-lg p-4 border border-lavender/30 text-center">
                          <div className="text-2xl font-bold text-lavender mb-1">
                            {new Set(loggedProcedures.map(p => p.supervisorName)).size}
                          </div>
                          <div className="text-sm text-ink/70">Supervisors</div>
                        </div>
                        <div className="bg-lavender/10 rounded-lg p-4 border border-lavender/30 text-center">
                          <div className="text-2xl font-bold text-lavender mb-1">
                            {Math.round((loggedProcedures.length / 50) * 100)}%
                          </div>
                          <div className="text-sm text-ink/70">Progress (50 req.)</div>
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

              {/* Procedure Type Breakdown */}
              <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-lavender" />
                    Procedure Type Breakdown
                  </CardTitle>
                  <CardDescription className="text-ink/70 font-medium">
                    Distribution of procedures by type for license requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="bg-white/80 rounded-xl p-6 border border-lavender/30">
                    {loggedProcedures.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-ink/70">No procedures logged yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(() => {
                          const procedureCounts = loggedProcedures.reduce((acc: any, procedure) => {
                            const type = procedure.procedureType.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                            acc[type] = (acc[type] || 0) + 1
                            return acc
                          }, {})
                          
                          return Object.entries(procedureCounts).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between p-3 bg-lavender/10 rounded-lg border border-lavender/30">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-lavender rounded-full"></div>
                                <span className="font-medium text-ink">{type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lavender font-bold">{count as number}</span>
                                <span className="text-ink/70 text-sm">procedures</span>
                              </div>
                            </div>
                          ))
                        })()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Supervisor Training Record */}
              <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
                    <Users className="h-6 w-6 text-lavender" />
                    Supervisor Training Record
                  </CardTitle>
                  <CardDescription className="text-ink/70 font-medium">
                    Detailed record of training sessions with each supervisor
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="bg-white/80 rounded-xl p-6 border border-lavender/30">
                    {loggedProcedures.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-ink/70">No training sessions logged yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(() => {
                          const supervisorGroups = loggedProcedures.reduce((acc: any, procedure) => {
                            const supervisor = procedure.supervisorName.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                            if (!acc[supervisor]) {
                              acc[supervisor] = []
                            }
                            acc[supervisor].push(procedure)
                            return acc
                          }, {})
                          
                          return Object.entries(supervisorGroups).map(([supervisor, procedures]) => (
                            <div key={supervisor} className="bg-lavender/10 rounded-lg p-4 border border-lavender/30">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Users className="h-5 w-5 text-lavender" />
                                  <span className="font-bold text-ink">{supervisor}</span>
                                </div>
                                <Badge variant="outline" className="bg-lavender/20 text-ink border-lavender">
                                  {(procedures as any[]).length} sessions
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div><span className="font-medium">License #:</span> {(procedures as any[])[0].supervisorLicense}</div>
                                <div><span className="font-medium">Last Session:</span> {new Date((procedures as any[]).sort((a, b) => new Date(b.procedureDate).getTime() - new Date(a.procedureDate).getTime())[0].procedureDate).toLocaleDateString()}</div>
                              </div>
                            </div>
                          ))
                        })()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Export & Download */}
              <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-lavender" />
                    Export & Download
                  </CardTitle>
                  <CardDescription className="text-ink/70 font-medium">
                    Generate reports for license submission and record keeping
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="bg-white/80 rounded-xl p-6 border border-lavender/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-ink">Export Options</h3>
                        <div className="space-y-3">
                          <Button 
                            onClick={() => exportToCSV()}
                            disabled={loggedProcedures.length === 0}
                            className="w-full bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <BookOpen className="h-5 w-5 mr-2" />
                            Export to CSV
                          </Button>
                          <Button 
                            onClick={() => generateLicenseReport()}
                            disabled={loggedProcedures.length === 0}
                            variant="outline"
                            className="w-full border-lavender/50 hover:bg-lavender/10"
                          >
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Generate License Report
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-ink">Report Info</h3>
                        <div className="bg-lavender/10 rounded-lg p-4 border border-lavender/30 space-y-2 text-sm">
                          <div><span className="font-medium">Total Records:</span> {loggedProcedures.length}</div>
                          <div><span className="font-medium">Date Range:</span> {
                            loggedProcedures.length > 0 
                              ? `${new Date(Math.min(...loggedProcedures.map(p => new Date(p.procedureDate).getTime()))).toLocaleDateString()} - ${new Date(Math.max(...loggedProcedures.map(p => new Date(p.procedureDate).getTime()))).toLocaleDateString()}`
                              : 'No data'
                          }</div>
                          <div><span className="font-medium">Ready for License:</span> {
                            loggedProcedures.length >= 50 ? '✅ Yes' : '❌ Need more procedures'
                          }</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inbox">
            <div className="space-y-6">
              {/* Messages List */}
              <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
                    <Users className="h-6 w-6 text-lavender" />
                    Messages
                  </CardTitle>
                  <CardDescription className="text-ink/70 font-medium">
                    Communicate with instructors and receive responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="bg-white/80 rounded-xl p-6 border border-lavender/30">
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-r from-lavender to-lavender-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-ink mb-2">No Messages Yet</h3>
                        <p className="text-ink/70 mb-4">
                          Start a conversation with an instructor by clicking the "Message" button on their profile.
                        </p>
                        <Button
                          onClick={() => setShowMessageComposer(true)}
                          className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Users className="h-5 w-5 mr-2" />
                          Compose Message
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div key={message.id} className="bg-lavender/10 rounded-lg p-4 border border-lavender/30">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-ink">{message.subject}</span>
                                  {!message.read && <div className="w-2 h-2 bg-lavender rounded-full"></div>}
                                </div>
                                <div className="text-sm text-ink/70">
                                  {message.type === 'sent' ? `To: ${message.to}` : `From: ${message.from}`}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-ink/70">
                                  {new Date(message.sentAt).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-ink/50">
                                  {new Date(message.sentAt).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-ink/80 mb-3 whitespace-pre-wrap">
                              {message.content}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleReplyMessage(message)}
                                variant="outline"
                                size="sm"
                                className="border-lavender/50 hover:bg-lavender/10"
                              >
                                <Users className="h-4 w-4 mr-1" />
                                Reply
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Test Message Modal Button */}
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => {
              console.log('Test button clicked, setting showMessageComposer to true')
              setShowMessageComposer(true)
              setNewMessage({
                to: 'Test Instructor',
                subject: 'Test Subject',
                content: ''
              })
            }}
            className="bg-red-500 hover:bg-red-600"
          >
            Test Modal
          </Button>
        </div>

        {/* Message Composer Modal */}
        {showMessageComposer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-ink">Send Message</CardTitle>
                    <CardDescription className="text-ink/70">
                      Send a message to {newMessage.to}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowMessageComposer(false)}
                    variant="ghost"
                    size="sm"
                    className="text-ink/50 hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="message-subject">Subject</Label>
                    <Input
                      id="message-subject"
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                      placeholder="Enter message subject"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message-content">Message</Label>
                    <textarea
                      id="message-content"
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                      placeholder="Type your message here..."
                      rows={6}
                      className="w-full p-3 border border-lavender/30 rounded-lg focus:ring-2 focus:ring-lavender/50 focus:border-lavender resize-none"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-lavender/20">
                  <Button
                    onClick={() => setShowMessageComposer(false)}
                    variant="outline"
                    className="border-lavender/50 hover:bg-lavender/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender-700 text-white"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Availability Manager Modal */}
        {showAvailabilityManager && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="relative overflow-hidden border-green-500/50 shadow-2xl bg-gradient-to-br from-white/95 to-green-50 backdrop-blur-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-ink">Manage Availability</CardTitle>
                    <CardDescription className="text-ink/70">
                      Block time slots when you have clients or are unavailable
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAvailabilityManager(false)}
                    variant="ghost"
                    size="sm"
                    className="text-ink/50 hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="availability-date">Date</Label>
                      <Input
                        id="availability-date"
                        type="date"
                        value={newAvailability.date}
                        onChange={(e) => setNewAvailability({ ...newAvailability, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <Label>Time Slots to Block</Label>
                      <div className="space-y-2 mt-2">
                        {timeSlots.map((slot) => (
                          <label key={slot} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={newAvailability.timeSlots.includes(slot)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewAvailability({
                                    ...newAvailability,
                                    timeSlots: [...newAvailability.timeSlots, slot]
                                  })
                                } else {
                                  setNewAvailability({
                                    ...newAvailability,
                                    timeSlots: newAvailability.timeSlots.filter(t => t !== slot)
                                  })
                                }
                              }}
                              className="rounded border-lavender/50"
                            />
                            <span className="text-sm text-ink">{slot}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="availability-reason">Reason (Optional)</Label>
                      <Input
                        id="availability-reason"
                        value={newAvailability.reason}
                        onChange={(e) => setNewAvailability({ ...newAvailability, reason: e.target.value })}
                        placeholder="e.g., Client appointment, Personal time"
                      />
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">Instructions</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Select the date you want to block</li>
                        <li>• Choose which time slots to block</li>
                        <li>• Add a reason for your reference</li>
                        <li>• Students won't be able to book blocked times</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-green-200/50">
                  <Button
                    onClick={() => setShowAvailabilityManager(false)}
                    variant="outline"
                    className="border-green-500/50 hover:bg-green-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAvailability}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Save Availability
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
