'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, Loader2 } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'

const AUTHORIZED_ROLES = ['owner', 'staff', 'manager', 'director']

interface TourRow {
  id: string
  start: string
  end: string
  status: string
  location: string | null
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

  const [form, setForm] = useState({ contactId: '', start: '', end: '', location: '', notes: '' })

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
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {tour.contact.firstName} {tour.contact.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(tour.start).toLocaleString()} • {tour.location || 'No location'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs uppercase tracking-wide">
                      {tour.status}
                    </Badge>
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
    </div>
  )
}
