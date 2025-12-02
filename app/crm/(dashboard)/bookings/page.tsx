'use client'
// Updated: 2024-11-21 - Client Bookings page
// Re-deploy: 2024-11-21 - Force rebuild

import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Calendar, Loader2, Plus, RefreshCcw, Edit, Trash2, User, Clock, FileText, Settings } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import Link from 'next/link'

const AUTHORIZED_ROLES = ['owner', 'staff', 'manager', 'director']

interface ClientBooking {
  id: string
  clientName: string
  bookingType: 'licensed_artist' | 'student' | 'intro_session' | 'tour'
  bookingDate: string
  procedureDate: string
  status: 'scheduled' | 'showed' | 'no_show' | 'cancelled'
  isPromo?: boolean
  notes?: string | null
  contact?: {
    id: string
    firstName: string
    lastName: string
    email?: string | null
    phone?: string | null
  } | null
  staff?: {
    id: string
    name: string
    email: string
  } | null
  createdAt: string
  updatedAt: string
}

export default function ClientBookingsPage() {
  const { currentUser } = useDemoAuth()
  const role = currentUser?.role?.toLowerCase() ?? ''
  const canAccess = AUTHORIZED_ROLES.includes(role)

  const [bookings, setBookings] = useState<ClientBooking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<ClientBooking | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0) // 0 = current month, 1 = previous, etc.
  const hasFetchedRef = useRef(false) // Track if we've fetched on mount
  const isMountedRef = useRef(true) // Track if component is mounted

  const [formData, setFormData] = useState({
    clientName: '',
    bookingType: 'licensed_artist' as 'licensed_artist' | 'student' | 'intro_session' | 'tour',
    bookingDate: '',
    procedureDate: '',
    status: 'scheduled' as 'scheduled' | 'showed' | 'no_show' | 'cancelled',
    isPromo: false,
    notes: '',
    contactId: ''
  })

  const fetchBookings = useCallback(async () => {
    if (!currentUser?.email || !isMountedRef.current) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/crm/bookings', {
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'Failed to load bookings')
      }
      
      const data = await response.json()
      if (isMountedRef.current) {
        setBookings(data.bookings || [])
        setError(null)
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Fetch bookings error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Unable to load bookings. Please try again.'
        setError(errorMessage)
        setBookings([])
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [currentUser?.email])

  useEffect(() => {
    if (!currentUser?.email || !canAccess || hasFetchedRef.current) return
    
    // Only fetch once on mount
    hasFetchedRef.current = true
    fetchBookings()
    
    return () => {
      isMountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email, canAccess])

  const handleCreateBooking = async () => {
    if (!currentUser?.email) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/crm/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          ...formData,
          contactId: formData.contactId || null
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to create booking')
      }

      setIsCreateDialogOpen(false)
      setFormData({
        clientName: '',
        bookingType: 'licensed_artist',
        bookingDate: '',
        procedureDate: '',
        status: 'scheduled',
        isPromo: false,
        notes: '',
        contactId: ''
      })
      await fetchBookings().catch(() => {})
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unable to create booking')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditBooking = async () => {
    if (!currentUser?.email || !selectedBooking) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/crm/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          ...formData,
          contactId: formData.contactId || null
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to update booking')
      }

      setIsEditDialogOpen(false)
      setSelectedBooking(null)
      await fetchBookings().catch(() => {})
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unable to update booking')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBooking = async () => {
    if (!currentUser?.email || !bookingToDelete) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/crm/bookings/${bookingToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete booking')
      }

      setDeleteConfirmOpen(false)
      setBookingToDelete(null)
      await fetchBookings().catch(() => {})
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unable to delete booking')
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (booking: ClientBooking) => {
    setSelectedBooking(booking)
    setFormData({
      clientName: booking.clientName,
      bookingType: booking.bookingType,
      bookingDate: booking.bookingDate.split('T')[0],
      procedureDate: booking.procedureDate.split('T')[0],
      status: booking.status,
      isPromo: booking.isPromo || false,
      notes: booking.notes || '',
      contactId: booking.contact?.id || ''
    })
    setIsEditDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      showed: 'bg-green-100 text-green-700 border-green-200',
      no_show: 'bg-red-100 text-red-700 border-red-200',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return variants[status] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getBookingTypeBadge = (type: string) => {
    if (type === 'licensed_artist') {
      return 'bg-purple-100 text-purple-700 border-purple-200'
    } else if (type === 'student') {
      return 'bg-orange-100 text-orange-700 border-orange-200'
    } else if (type === 'tour') {
      return 'bg-teal-100 text-teal-700 border-teal-200'
    } else {
      return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const getBookingTypeLabel = (type: string) => {
    if (type === 'licensed_artist') return 'Licensed Artist'
    if (type === 'student') return 'Student'
    if (type === 'intro_session') return 'Intro Session'
    if (type === 'tour') return 'Tour'
    return type
  }

  const canEditShowedStatus = () => {
    const userRole = currentUser?.role?.toLowerCase() ?? ''
    return userRole === 'owner' || userRole === 'hr'
  }

  const fetchReport = async (monthOffset: number) => {
    if (!currentUser?.email) return
    
    setReportLoading(true)
    try {
      const response = await fetch(`/api/crm/bookings/report?monthOffset=${monthOffset}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        }
      })
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
        setSelectedMonthOffset(monthOffset)
        if (!reportDialogOpen) {
          setReportDialogOpen(true)
        }
      } else {
        setError('Failed to generate report')
      }
    } catch (err) {
      setError('Failed to generate report')
    } finally {
      setReportLoading(false)
    }
  }

  const getMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i <= 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = date.toLocaleString('default', { month: 'long', year: 'numeric' })
      options.push({ value: i, label: i === 0 ? `${label} (Current)` : label })
    }
    return options
  }

  if (!canAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CRM Access Required</CardTitle>
          <CardDescription>
            Only staff, directors, managers, or owners can view Client Bookings. Contact your administrator for access.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold text-slate-900">Client Bookings</h1>
            <Link href="/crm/bookings/settings">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
          <p className="text-sm text-slate-600">
            Track client bookings for commission payments. Monitor shows, no-shows, and booking details.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              if (!isLoading) {
                fetchBookings()
              }
            }} 
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={async () => {
              setSelectedMonthOffset(0) // Reset to current month when opening
              await fetchReport(0)
            }}
            disabled={reportLoading}
            className="gap-2"
          >
            {reportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Generate Report
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Calendar className="h-5 w-5 text-slate-500" />
            Booking History
          </CardTitle>
          <CardDescription>
            All client bookings for commission tracking. Filter by status or booking type using the filters above.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !bookings.length ? (
            <div className="flex h-40 items-center justify-center text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-sm font-medium text-slate-900">No bookings yet</p>
              <p className="text-sm text-slate-500 mt-1">Create your first booking to start tracking commissions.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create Booking
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map(booking => (
                <div
                  key={booking.id}
                  className={`rounded-lg border border-slate-200 p-4 shadow-sm transition-shadow ${
                    booking.status === 'showed' 
                      ? 'bg-gray-100 opacity-75' 
                      : 'bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{booking.clientName}</h3>
                        <Badge className={getBookingTypeBadge(booking.bookingType)}>
                          {getBookingTypeLabel(booking.bookingType)}
                        </Badge>
                        <Badge className={getStatusBadge(booking.status)}>
                          {booking.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {booking.isPromo && (
                          <Badge className="bg-pink-100 text-pink-700 border-pink-200">
                            Promo
                          </Badge>
                        )}
                      </div>
                      <div className="grid gap-2 md:grid-cols-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>
                            <strong>Booking:</strong> {new Date(booking.bookingDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>
                            <strong>Procedure:</strong> {new Date(booking.procedureDate).toLocaleDateString()}
                          </span>
                        </div>
                        {booking.contact && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <span>
                              <strong>Contact:</strong> {booking.contact.firstName} {booking.contact.lastName}
                            </span>
                          </div>
                        )}
                      </div>
                      {booking.notes && (
                        <p className="mt-2 text-sm text-slate-600">
                          <strong>Notes:</strong> {booking.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(booking)}
                        className="gap-2"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setBookingToDelete(booking.id)
                          setDeleteConfirmOpen(true)
                        }}
                        className="gap-2"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Booking Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>Add a new client booking for commission tracking.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="Enter client name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bookingType">Booking Type *</Label>
              <Select
                value={formData.bookingType}
                onValueChange={value => setFormData({ ...formData, bookingType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="licensed_artist">Licensed Artist</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="intro_session">Intro Session</SelectItem>
                  <SelectItem value="tour">Tour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="bookingDate">Booking Date *</Label>
                <Input
                  id="bookingDate"
                  type="date"
                  value={formData.bookingDate}
                  onChange={e => setFormData({ ...formData, bookingDate: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="procedureDate">Procedure Date *</Label>
                <Input
                  id="procedureDate"
                  type="date"
                  value={formData.procedureDate}
                  onChange={e => setFormData({ ...formData, procedureDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={value => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="showed">Showed</SelectItem>
                  <SelectItem value="no_show">No-Show</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPromo"
                checked={formData.isPromo}
                onChange={e => setFormData({ ...formData, isPromo: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isPromo" className="cursor-pointer">
                Promotional Booking
              </Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBooking} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>Update booking details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-clientName">Client Name *</Label>
              <Input
                id="edit-clientName"
                value={formData.clientName}
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-bookingType">Booking Type *</Label>
              <Select
                value={formData.bookingType}
                onValueChange={value => setFormData({ ...formData, bookingType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="licensed_artist">Licensed Artist</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="intro_session">Intro Session</SelectItem>
                  <SelectItem value="tour">Tour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-bookingDate">Booking Date *</Label>
                <Input
                  id="edit-bookingDate"
                  type="date"
                  value={formData.bookingDate}
                  onChange={e => setFormData({ ...formData, bookingDate: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-procedureDate">Procedure Date *</Label>
                <Input
                  id="edit-procedureDate"
                  type="date"
                  value={formData.procedureDate}
                  onChange={e => setFormData({ ...formData, procedureDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={value => {
                  // Check if trying to change from 'showed' to another status
                  if (selectedBooking?.status === 'showed' && value !== 'showed' && !canEditShowedStatus()) {
                    setError('Only owners and HR can change status from "Showed"')
                    return
                  }
                  setFormData({ ...formData, status: value as any })
                }}
                disabled={selectedBooking?.status === 'showed' && !canEditShowedStatus()}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="showed">Showed</SelectItem>
                  <SelectItem value="no_show">No-Show</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {selectedBooking?.status === 'showed' && !canEditShowedStatus() && (
                <p className="text-xs text-amber-600">
                  Only owners and HR can change status from "Showed"
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-isPromo"
                checked={formData.isPromo}
                onChange={e => setFormData({ ...formData, isPromo: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="edit-isPromo" className="cursor-pointer">
                Promotional Booking
              </Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBooking} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBooking} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Completed Bookings Report</DialogTitle>
            <DialogDescription>
              Report showing all completed bookings (status: Showed) for {reportData?.period?.month || 'current month'} with client names, booking types, and promo status.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 py-2 border-b">
            <Label htmlFor="month-select" className="text-sm font-medium text-slate-700">
              View Report For:
            </Label>
            <Select
              value={selectedMonthOffset.toString()}
              onValueChange={(value) => {
                const offset = parseInt(value, 10)
                fetchReport(offset)
              }}
              disabled={reportLoading}
            >
              <SelectTrigger id="month-select" className="w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getMonthOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {reportLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>
          {reportData && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Total Completed</p>
                  <p className="text-2xl font-bold text-slate-900">{reportData.totals?.totalCompleted || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Licensed Artist</p>
                  <p className="text-2xl font-bold text-purple-700">{reportData.totals?.licensedCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Student</p>
                  <p className="text-2xl font-bold text-orange-700">{reportData.totals?.studentCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Intro Session</p>
                  <p className="text-2xl font-bold text-blue-700">{reportData.totals?.introSessionCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Tour</p>
                  <p className="text-2xl font-bold text-teal-700">{reportData.totals?.tourCount || 0}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Promo</p>
                  <p className="text-2xl font-bold text-pink-700">{reportData.totals?.promoCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">No Promo</p>
                  <p className="text-2xl font-bold text-slate-700">{reportData.totals?.noPromoCount || 0}</p>
                </div>
              </div>
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Client Name</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Booking Type</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Procedure Date</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Promo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.bookings && reportData.bookings.length > 0 ? (
                      reportData.bookings.map((booking: any) => (
                        <tr key={booking.id} className="border-t">
                          <td className="px-4 py-2 text-sm">{booking.clientName}</td>
                          <td className="px-4 py-2 text-sm">
                            <Badge className={getBookingTypeBadge(booking.bookingType)}>
                              {getBookingTypeLabel(booking.bookingType)}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {new Date(booking.procedureDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {booking.isPromo ? (
                              <Badge className="bg-pink-100 text-pink-700 border-pink-200">Promo</Badge>
                            ) : (
                              <span className="text-slate-500">No Promo</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                          No completed bookings found for this month
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
