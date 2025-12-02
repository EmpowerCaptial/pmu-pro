'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, History, UserSquare2, Plus, Edit } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const AUTHORIZED_ROLES = ['owner', 'staff', 'manager', 'director']

interface ContactDetail {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  source?: string | null
  stage: string
  score: number
  tags: string[]
  owner?: {
    id: string
    name: string
    email: string
  } | null
  tasks: Array<{
    id: string
    title: string
    status: string
    dueAt: string | null
  }>
  tours: Array<{
    id: string
    start: string
    end: string
    status: string
    location: string | null
  }>
  applications: Array<{
    id: string
    status: string
    missingDocs: string[]
    createdAt: string
  }>
  enrollments: Array<{
    id: string
    cohort: string
    depositPaid: boolean
    createdAt: string
  }>
  consents: Array<{
    id: string
    channel: string
    status: string
    timestamp: string
  }>
  interactions: Array<{
    id: string
    type: string
    direction: string
    subject: string | null
    body: string | null
    createdAt: string
    staff?: {
      id: string
      name: string
      email: string
    } | null
  }>
}

export default function ContactDetailPage() {
  const params = useParams()
  const contactId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined)
  const { currentUser } = useDemoAuth()
  const role = currentUser?.role?.toLowerCase() ?? ''
  const canAccess = AUTHORIZED_ROLES.includes(role)

  const [contact, setContact] = useState<ContactDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [note, setNote] = useState({ subject: '', body: '' })
  const [task, setTask] = useState({ title: '', dueAt: '' })
  const [tour, setTour] = useState({ start: '', end: '', location: '', notes: '' })
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    source: '',
    stage: ''
  })

  useEffect(() => {
    if (!contactId || !currentUser?.email || !canAccess) return
    fetchContact()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId, currentUser?.email, canAccess])

  const fetchContact = async () => {
    if (!contactId || !currentUser?.email) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/crm/contacts/${contactId}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        }
      })
      if (!response.ok) {
        throw new Error('Failed to load contact')
      }
      const data = await response.json()
      setContact(data.contact)
    } catch (err) {
      console.error(err)
      setError('Unable to load contact information.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!contactId || !currentUser?.email) return
    try {
      const response = await fetch(`/api/crm/contacts/${contactId}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          type: 'NOTE',
          direction: 'OUT',
          subject: note.subject,
          body: note.body
        })
      })
      if (!response.ok) {
        throw new Error('Failed to add note')
      }
      setNote({ subject: '', body: '' })
      fetchContact()
    } catch (err) {
      console.error(err)
      setError('Unable to log note.')
    }
  }

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!contactId || !currentUser?.email) return
    try {
      const response = await fetch('/api/crm/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          ...task,
          contactId
        })
      })
      if (!response.ok) {
        throw new Error('Failed to create task')
      }
      setTask({ title: '', dueAt: '' })
      fetchContact()
    } catch (err) {
      console.error(err)
      setError('Unable to create task.')
    }
  }

  const handleScheduleTour = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!contactId || !currentUser?.email) return
    try {
      const response = await fetch('/api/crm/tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          contactId,
          ...tour
        })
      })
      if (!response.ok) {
        throw new Error('Failed to schedule tour')
      }
      setTour({ start: '', end: '', location: '', notes: '' })
      fetchContact()
    } catch (err) {
      console.error(err)
      setError('Unable to schedule tour.')
    }
  }

  const stageLabel = useMemo(() => contact?.stage.replace('_', ' ') ?? '', [contact?.stage])

  const openEditDialog = () => {
    if (contact) {
      setEditForm({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email || '',
        phone: contact.phone || '',
        source: contact.source || '',
        stage: contact.stage
      })
      setIsEditDialogOpen(true)
    }
  }

  const handleUpdateContact = async () => {
    if (!contactId || !currentUser?.email) return

    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      setError('First name and last name are required')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/crm/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          email: editForm.email.trim() || null,
          phone: editForm.phone.trim() || null,
          source: editForm.source.trim() || null,
          stage: editForm.stage
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to update contact')
      }

      const data = await response.json()
      setContact(data.contact)
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unable to update contact')
    } finally {
      setIsSaving(false)
    }
  }

  if (!canAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CRM Access Required</CardTitle>
          <CardDescription>Only staff or owners can view contact timelines.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading contact...
      </div>
    )
  }

  if (!contact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contact not found</CardTitle>
          <CardDescription>{error || 'We could not locate this record.'}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const STAGES = [
    { value: 'LEAD', label: 'Leads' },
    { value: 'TOUR_SCHEDULED', label: 'Tour Scheduled' },
    { value: 'TOURED', label: 'Toured' },
    { value: 'APP_STARTED', label: 'Application Started' },
    { value: 'APP_SUBMITTED', label: 'Application Submitted' },
    { value: 'ENROLLED', label: 'Enrolled' },
    { value: 'NO_SHOW', label: 'No-Show' },
    { value: 'NURTURE', label: 'Nurture' }
  ] as const

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div className="space-y-1">
          <Badge variant="outline" className="border-slate-300 text-slate-600">Contact</Badge>
          <h1 className="text-3xl font-semibold text-slate-900">{contact.firstName} {contact.lastName}</h1>
          <p className="text-sm text-slate-600">
            Stage: {stageLabel} • Owner: {contact.owner?.name || 'Unassigned'}
          </p>
        </div>
        <Button onClick={openEditDialog} variant="outline" className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Contact
        </Button>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <UserSquare2 className="h-5 w-5 text-slate-500" />
              Profile Summary
            </CardTitle>
            <CardDescription>Quick stats and upcoming milestones.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>Email: {contact.email || '—'}</p>
            <p>Phone: {contact.phone || '—'}</p>
            <p>Source: {contact.source || '—'}</p>
            <p>Score: {contact.score}</p>
            {contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {contact.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="border-t border-slate-200 pt-3">
              <h3 className="text-sm font-semibold text-slate-900">Tours</h3>
              <div className="space-y-2">
                {contact.tours.map(tour => (
                  <div key={tour.id} className="rounded-md bg-slate-50 p-2 text-xs text-slate-600">
                    <p>{new Date(tour.start).toLocaleString()} • {tour.status}</p>
                    <p>Location: {tour.location || '—'}</p>
                  </div>
                ))}
                {contact.tours.length === 0 && <p className="text-xs text-slate-500">No tours scheduled.</p>}
              </div>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <h3 className="text-sm font-semibold text-slate-900">Applications</h3>
              {contact.applications.length === 0 && <p className="text-xs text-slate-500">No applications yet.</p>}
              {contact.applications.map(app => (
                <div key={app.id} className="rounded-md bg-slate-50 p-2 text-xs text-slate-600">
                  <p>Status: {app.status}</p>
                  {app.missingDocs.length > 0 && <p>Missing: {app.missingDocs.join(', ')}</p>}
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-3">
              <h3 className="text-sm font-semibold text-slate-900">Enrollments</h3>
              {contact.enrollments.length === 0 && <p className="text-xs text-slate-500">No cohort yet.</p>}
              {contact.enrollments.map(enrollment => (
                <div key={enrollment.id} className="rounded-md bg-slate-50 p-2 text-xs text-slate-600">
                  <p>Cohort: {enrollment.cohort}</p>
                  <p>Deposit: {enrollment.depositPaid ? 'Paid' : 'Outstanding'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-dashed border-slate-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                <History className="h-5 w-5 text-slate-500" />
                Timeline
              </CardTitle>
              <CardDescription>Log every touchpoint. Notes, SMS, emails, and calls roll up here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3" onSubmit={handleAddNote}>
                <div className="flex flex-col gap-2 md:flex-row">
                  <Input
                    placeholder="Subject"
                    value={note.subject}
                    onChange={event => setNote(prev => ({ ...prev, subject: event.target.value }))}
                    required
                  />
                  <Button type="submit" className="gap-2" disabled={!note.body || !note.subject}>
                    <Plus className="h-4 w-4" /> Log Note
                  </Button>
                </div>
                <Textarea
                  placeholder="Add context, outcomes, or next steps"
                  value={note.body}
                  onChange={event => setNote(prev => ({ ...prev, body: event.target.value }))}
                  rows={3}
                  required
                />
              </form>
              <div className="space-y-3">
                {contact.interactions.map(interaction => (
                  <div key={interaction.id} className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{new Date(interaction.createdAt).toLocaleString()}</span>
                      <span>{interaction.staff?.name || 'System'}</span>
                    </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {interaction.type} • {interaction.direction}
                      </div>
                      <div className="text-sm text-slate-700">{interaction.subject || 'No subject'}</div>
                      {interaction.body && <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">{interaction.body}</p>}
                  </div>
                ))}
                {contact.interactions.length === 0 && <p className="text-sm text-slate-500">No interactions logged yet.</p>}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900">Create Task</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={handleCreateTask}>
                  <div className="space-y-1">
                    <Label htmlFor="task-title">Title</Label>
                    <Input
                      id="task-title"
                      value={task.title}
                      onChange={event => setTask(prev => ({ ...prev, title: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="task-due">Due Date</Label>
                    <Input
                      id="task-due"
                      type="datetime-local"
                      value={task.dueAt}
                      onChange={event => setTask(prev => ({ ...prev, dueAt: event.target.value }))}
                    />
                  </div>
                  <Button type="submit" className="gap-2">
                    <Plus className="h-4 w-4" /> Save Task
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900">Schedule Tour</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={handleScheduleTour}>
                  <div className="space-y-1">
                    <Label htmlFor="tour-start">Start</Label>
                    <Input
                      id="tour-start"
                      type="datetime-local"
                      value={tour.start}
                      onChange={event => setTour(prev => ({ ...prev, start: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tour-end">End</Label>
                    <Input
                      id="tour-end"
                      type="datetime-local"
                      value={tour.end}
                      onChange={event => setTour(prev => ({ ...prev, end: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tour-location">Location</Label>
                    <Input
                      id="tour-location"
                      value={tour.location}
                      onChange={event => setTour(prev => ({ ...prev, location: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tour-notes">Notes</Label>
                    <Textarea
                      id="tour-notes"
                      value={tour.notes}
                      onChange={event => setTour(prev => ({ ...prev, notes: event.target.value }))}
                      rows={2}
                    />
                  </div>
                  <Button type="submit" className="gap-2">
                    <Plus className="h-4 w-4" /> Schedule Tour
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name *</Label>
                <Input
                  id="edit-firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name *</Label>
                <Input
                  id="edit-lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-source">Source</Label>
              <Input
                id="edit-source"
                value={editForm.source}
                onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                placeholder="e.g., Website, Referral, Event"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stage">Stage</Label>
              <Select value={editForm.stage} onValueChange={(value) => setEditForm({ ...editForm, stage: value })}>
                <SelectTrigger id="edit-stage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateContact} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
