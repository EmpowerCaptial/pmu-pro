'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, Loader2, Edit, Trash2 } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

const AUTHORIZED_ROLES = ['owner', 'staff', 'manager', 'director']

interface TourRow {
  id: string
  start: string
  end: string
  status: string
  location: string | null
  notes?: string | null
  contact: {
    id: string
    firstName: string
    lastName: string
    email: string | null
  }
}

export default function CrmCalendarPage() {
  const { currentUser } = useDemoAuth()
  const role = currentUser?.role?.toLowerCase() ?? ''
  const canAccess = AUTHORIZED_ROLES.includes(role)

  const [tours, setTours] = useState<TourRow[]>([])
  const [range, setRange] = useState<'upcoming' | 'past' | 'all'>('upcoming')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTour, setSelectedTour] = useState<TourRow | null>(null)

  const [form, setForm] = useState({ contactId: '', start: '', end: '', location: '', notes: '' })
  const [editForm, setEditForm] = useState({ start: '', end: '', location: '', status: 'SCHEDULED', notes: '' })

  useEffect(() => {
    if (!currentUser?.email || !canAccess) return
    fetchTours()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email, range, canAccess])

  const fetchTours = async () => {
    if (!currentUser?.email) return
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ range })
      const response = await fetch(`/api/crm/tours?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        }
      })
      if (!response.ok) {
        throw new Error('Failed to load tours')
      }
      const data = await response.json()
      setTours(data.tours || [])
    } catch (err) {
      console.error(err)
      setError('Unable to load tours.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTour = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentUser?.email) return
    try {
      const response = await fetch('/api/crm/tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify(form)
      })
      if (!response.ok) {
        throw new Error('Failed to schedule tour')
      }
      setForm({ contactId: '', start: '', end: '', location: '', notes: '' })
      fetchTours()
    } catch (err) {
      console.error(err)
      setError('Unable to schedule tour.')
    }
  }

  const sortedTours = useMemo(() => {
    return [...tours].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }, [tours])

  const openEditDialog = (tour: TourRow) => {
    setSelectedTour(tour)
    setEditForm({
      start: new Date(tour.start).toISOString().slice(0, 16),
      end: new Date(tour.end).toISOString().slice(0, 16),
      location: tour.location || '',
      status: tour.status,
      notes: tour.notes || ''
    })
    setIsEditDialogOpen(true)
  }

  const handleEditTour = async () => {
    if (!selectedTour || !currentUser?.email) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/crm/tours/${selectedTour.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to update tour')
      }

      setIsEditDialogOpen(false)
      setSelectedTour(null)
      await fetchTours()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unable to update tour')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTour = async () => {
    if (!selectedTour || !currentUser?.email) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/crm/tours/${selectedTour.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete tour')
      }

      setIsDeleteDialogOpen(false)
      setSelectedTour(null)
      await fetchTours()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unable to delete tour')
    } finally {
      setIsLoading(false)
    }
  }

  if (!canAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CRM Access Required</CardTitle>
          <CardDescription>This calendar is restricted to staff and owners.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Tour & Event Calendar</h1>
        <p className="text-sm text-slate-600">
          Schedule tours, assign rooms, and capture outcomes. Automated reminders can hook into Twilio once you’re ready.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <CalendarDays className="h-5 w-5 text-slate-500" />
              Upcoming Tours
            </CardTitle>
            <CardDescription>Filter by date range. Add your own filters (campus, advisor) as the CRM matures.</CardDescription>
          </div>
          <Select value={range} onValueChange={value => setRange(value as typeof range)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          )}
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading tours...
            </div>
          ) : sortedTours.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">No tours scheduled in this range.</div>
          ) : (
            <div className="space-y-3">
              {sortedTours.map(tour => (
                <div key={tour.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <p className="text-base font-semibold text-slate-900">
                        {tour.contact.firstName} {tour.contact.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(tour.start).toLocaleString()} - {new Date(tour.end).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {tour.location || 'No location'}
                      </p>
                      {tour.notes && (
                        <p className="text-xs text-slate-600 mt-1">
                          Notes: {tour.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs uppercase tracking-wide">
                        {tour.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(tour)}
                        className="gap-2"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedTour(tour)
                          setIsDeleteDialogOpen(true)
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

      <Card className="border-dashed border-slate-300">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">Schedule a Tour</CardTitle>
          <CardDescription>Connect a contact ID from the pipeline and reserve a room slot.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateTour}>
            <div className="space-y-1">
              <Label htmlFor="contactId">Contact ID</Label>
              <Input
                id="contactId"
                value={form.contactId}
                onChange={event => setForm(prev => ({ ...prev, contactId: event.target.value }))}
                placeholder="Paste the contact ID"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="location">Location / Room</Label>
              <Input
                id="location"
                value={form.location}
                onChange={event => setForm(prev => ({ ...prev, location: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="start">Start</Label>
              <Input
                id="start"
                type="datetime-local"
                value={form.start}
                onChange={event => setForm(prev => ({ ...prev, start: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="end">End</Label>
              <Input
                id="end"
                type="datetime-local"
                value={form.end}
                onChange={event => setForm(prev => ({ ...prev, end: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={form.notes}
                onChange={event => setForm(prev => ({ ...prev, notes: event.target.value }))}
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" className="gap-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
                Schedule
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Edit Tour Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tour / Event</DialogTitle>
            <DialogDescription>
              Update tour details for {selectedTour?.contact.firstName} {selectedTour?.contact.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-start">Start *</Label>
                <Input
                  id="edit-start"
                  type="datetime-local"
                  value={editForm.start}
                  onChange={e => setEditForm({ ...editForm, start: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-end">End *</Label>
                <Input
                  id="edit-end"
                  type="datetime-local"
                  value={editForm.end}
                  onChange={e => setEditForm({ ...editForm, end: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location / Room *</Label>
              <Input
                id="edit-location"
                value={editForm.location}
                onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status *</Label>
              <Select
                value={editForm.status}
                onValueChange={value => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                value={editForm.notes}
                onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTour} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tour / Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tour for {selectedTour?.contact.firstName} {selectedTour?.contact.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTour} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
