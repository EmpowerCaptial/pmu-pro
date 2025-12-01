'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { KanbanSquare, Loader2, Plus, RefreshCcw, Mail, Copy, ExternalLink } from 'lucide-react'
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

interface PipelineContact {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  source?: string | null
  tags: string[]
  stage: string
  score: number
  owner: { id: string; name: string; email: string } | null
  lastInteraction: {
    id: string
    type: string
    direction: string
    subject: string | null
    createdAt: string
  } | null
  nextTour: {
    id: string
    start: string
    status: string
    location: string | null
  } | null
  openTasks: {
    id: string
    title: string
    dueAt: string | null
    status: string
  }[]
}

interface PipelineColumn {
  stage: string
  contacts: PipelineContact[]
}

interface PipelineResponse {
  totals: {
    totalContacts: number
    stageCounts: Record<string, number>
  }
  columns: PipelineColumn[]
}

const AUTHORIZED_ROLES = ['owner', 'staff', 'manager', 'director']

type StageValue = (typeof STAGES)[number]['value']

export default function CrmPipelinePage() {
  const { currentUser } = useDemoAuth()
  const role = currentUser?.role?.toLowerCase() ?? ''
  const canAccess = AUTHORIZED_ROLES.includes(role)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pipeline, setPipeline] = useState<PipelineResponse | null>(null)
  const [draggingContactId, setDraggingContactId] = useState<string | null>(null)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<PipelineContact | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailClientOpened, setEmailClientOpened] = useState(false)

  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    source: ''
  })

  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: ''
  })

  const stageLookup = useMemo(() => {
    return STAGES.reduce<Record<string, string>>((acc, stage) => {
      acc[stage.value] = stage.label
      return acc
    }, {})
  }, [])

  useEffect(() => {
    if (!currentUser?.email || !canAccess) return
    fetchPipeline()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email, canAccess])

  const fetchPipeline = async () => {
    if (!currentUser?.email) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/crm/pipeline', {
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        }
      })
      if (!response.ok) {
        throw new Error('Failed to load pipeline')
      }
      const data: PipelineResponse = await response.json()
      setPipeline(data)
    } catch (err) {
      console.error(err)
      setError('Unable to load pipeline. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentUser?.email) return

    // Client-side validation: require at least email or phone
    const email = newContact.email?.trim() || ''
    const phone = newContact.phone?.trim() || ''
    
    if (!email && !phone) {
      setError('Either email or phone number is required to create a contact.')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/crm/pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          firstName: newContact.firstName.trim(),
          lastName: newContact.lastName.trim(),
          email: email || null, // Send null instead of empty string
          phone: phone || null, // Send null instead of empty string
          source: newContact.source?.trim() || null,
          tags: []
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to create contact')
      }

      setNewContact({ firstName: '', lastName: '', email: '', phone: '', source: '' })
      await fetchPipeline()
      setIsLoading(false)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unable to create contact')
      setIsLoading(false)
    }
  }

  const handleStageChange = async (contactId: string, stage: StageValue) => {
    if (!currentUser?.email) return
    try {
      const response = await fetch(`/api/crm/pipeline/${contactId}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({ stage })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to update stage')
      }

      setPipeline(prev => {
        if (!prev) return prev
        const updated = { ...prev }
        updated.columns = updated.columns.map(column => ({
          ...column,
          contacts: column.contacts.filter(contact => contact.id !== contactId)
        }))
        return updated
      })

      await fetchPipeline()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unable to update stage')
    }
  }

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, contactId: string) => {
    setDraggingContactId(contactId)
    event.dataTransfer.setData('text/plain', contactId)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, stage: StageValue) => {
    event.preventDefault()
    const contactId = event.dataTransfer.getData('text/plain') || draggingContactId
    setDraggingContactId(null)
    if (!contactId) return
    await handleStageChange(contactId, stage)
  }

  const handleOpenEmailDialog = (contact: PipelineContact) => {
    if (!contact.email) {
      setError('This contact does not have an email address.')
      return
    }
    setSelectedContact(contact)
    setEmailForm({
      subject: '',
      message: ''
    })
    setEmailDialogOpen(true)
  }

  const handleSendEmail = async () => {
    if (!selectedContact?.email || !currentUser?.email) return
    
    if (!emailForm.subject || !emailForm.message) {
      setError('Please fill in all required fields.')
      return
    }

    setSendingEmail(true)
    setError(null)

    try {
      const response = await fetch('/api/crm/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          contactId: selectedContact.id,
          to: selectedContact.email,
          subject: emailForm.subject,
          message: emailForm.message
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to send email')
      }

      setEmailDialogOpen(false)
      setSelectedContact(null)
      setEmailForm({ subject: '', message: '' })
      await fetchPipeline() // Refresh to show new interaction
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : 'Unable to send email'
      setError(errorMessage)
      // Don't close dialog on error so user can try alternative method
    } finally {
      setSendingEmail(false)
    }
  }

  const handleOpenEmailClient = () => {
    if (!selectedContact?.email) {
      setError('No email address available for this contact.')
      return
    }
    
    if (!emailForm.subject && !emailForm.message) {
      setError('Please enter a subject or message before opening email client.')
      return
    }
    
    try {
      const subject = encodeURIComponent(emailForm.subject || '')
      const body = encodeURIComponent(emailForm.message || '')
      const mailtoLink = `mailto:${selectedContact.email}?subject=${subject}&body=${body}`
      
      // Use window.open for better compatibility, fallback to location.href
      const emailWindow = window.open(mailtoLink, '_blank')
      
      // If window.open fails (blocked by popup blocker), try location.href
      if (!emailWindow || emailWindow.closed || typeof emailWindow.closed === 'undefined') {
        // Create a temporary anchor element and click it
        const link = document.createElement('a')
        link.href = mailtoLink
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      
      // Show success message (using a temporary info state)
      setError(null)
      // Note: In a real implementation, you might want a separate success state
      // For now, we'll just clear any existing errors
    } catch (err) {
      console.error('Failed to open email client:', err)
      setError('Unable to open email client. Please copy the email details and send manually.')
    }
  }

  const handleCopyEmailDetails = async () => {
    if (!selectedContact?.email) return
    
    const emailText = `To: ${selectedContact.email}\nSubject: ${emailForm.subject}\n\n${emailForm.message}`
    
    try {
      await navigator.clipboard.writeText(emailText)
      setError(null)
      // Show success message briefly
      const originalError = error
      setError('Email details copied to clipboard!')
      setTimeout(() => setError(originalError), 2000)
    } catch (err) {
      setError('Failed to copy to clipboard')
    }
  }

  if (!canAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CRM Access Required</CardTitle>
          <CardDescription>
            Only staff, directors, managers, or owners can view the Studio CRM. Contact your administrator for access.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Badge variant="outline" className="border-slate-300 text-slate-600">CRM</Badge>
        <h1 className="text-3xl font-semibold text-slate-900">Pipeline Overview</h1>
        <p className="text-sm text-slate-600">
          Track every prospect from lead to enrollment. Create new contacts, move them between stages, and monitor SLAs in one view.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <KanbanSquare className="h-5 w-5 text-slate-500" />
              Pipeline
            </CardTitle>
            <CardDescription>
              Drag and drop is coming soon. For now, use the stage menu to move contacts across the funnel.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={fetchPipeline} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {pipeline && (
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span>Total contacts: <strong>{pipeline.totals.totalContacts}</strong></span>
              {STAGES.map(stage => (
                <span key={stage.value}>
                  {stage.label}: <strong>{pipeline.totals.stageCounts[stage.value] ?? 0}</strong>
                </span>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
          {emailClientOpened && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
              Email client should be opening. If it doesn't, check your browser settings or use the Copy button.
            </div>
          )}

          <div className="grid gap-4 overflow-x-auto xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1">
            {pipeline
              ? pipeline.columns.map(column => (
                  <div
                    key={column.stage}
                    className="flex min-w-[280px] flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    onDragOver={handleDragOver}
                    onDrop={event => handleDrop(event, column.stage as StageValue)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{stageLookup[column.stage] ?? column.stage}</h3>
                        <p className="text-xs text-slate-500">{column.contacts.length} contact(s)</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {column.contacts.map(contact => (
                        <div
                          key={contact.id}
                          className="rounded-md border border-slate-200 bg-slate-50 p-3 shadow-sm"
                          draggable
                          onDragStart={event => handleDragStart(event, contact.id)}
                          onDragEnd={() => setDraggingContactId(null)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{contact.name || 'Unnamed Contact'}</p>
                              <p className="text-xs text-slate-500">{contact.email || 'No email'} • {contact.phone || 'No phone'}</p>
                            </div>
                            <div className="flex gap-1">
                              {contact.email && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenEmailDialog(contact)}
                                  className="h-7 px-2 text-xs"
                                  title="Send Email"
                                >
                                  <Mail className="h-3 w-3" />
                                </Button>
                              )}
                              <Select value={contact.stage} onValueChange={value => handleStageChange(contact.id, value as StageValue)}>
                                <SelectTrigger className="h-8 w-[140px] text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STAGES.map(stage => (
                                    <SelectItem key={stage.value} value={stage.value}>
                                      {stage.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="mt-2 space-y-1 text-xs text-slate-600">
                            {contact.source && <p>Source: {contact.source}</p>}
                            {contact.owner && <p>Owner: {contact.owner.name}</p>}
                            {contact.lastInteraction && (
                              <p>
                                Last touch: {contact.lastInteraction.type} • {new Date(contact.lastInteraction.createdAt).toLocaleDateString()}
                              </p>
                            )}
                            {contact.nextTour && (
                              <p className="text-blue-600">
                                Tour: {new Date(contact.nextTour.start).toLocaleString()} ({contact.nextTour.status})
                              </p>
                            )}
                            {contact.openTasks.length > 0 && (
                              <p className="text-amber-600">Open tasks: {contact.openTasks.length}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              : (
                <div className="text-center text-sm text-slate-500">No pipeline data yet. Add a contact to get started.</div>
              )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Plus className="h-4 w-4" /> Create Contact
          </CardTitle>
          <CardDescription>
            Quick entry for leads captured by phone, events, or referrals. Add more details later from the contact profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateContact}>
            <div className="space-y-1">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={newContact.firstName}
                onChange={event => setNewContact(prev => ({ ...prev, firstName: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={newContact.lastName}
                onChange={event => setNewContact(prev => ({ ...prev, lastName: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={newContact.email}
                onChange={event => setNewContact(prev => ({ ...prev, email: event.target.value }))}
                placeholder="Enter email if available"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={newContact.phone}
                onChange={event => setNewContact(prev => ({ ...prev, phone: event.target.value }))}
                placeholder="Enter phone if available"
              />
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-slate-500">
                <strong>Note:</strong> At least one contact method (email or phone) is required to save.
              </p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                placeholder="Instagram, Website, Referral, Event..."
                value={newContact.source}
                onChange={event => setNewContact(prev => ({ ...prev, source: event.target.value }))}
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Contact
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Send Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Email to {selectedContact?.name || 'Contact'}</DialogTitle>
            <DialogDescription>
              Send an email to {selectedContact?.email || 'this contact'} using the verified SendGrid sender address.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email-to">To</Label>
              <Input
                id="email-to"
                value={selectedContact?.email || ''}
                disabled
                className="bg-slate-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email-subject">Subject *</Label>
              <Input
                id="email-subject"
                value={emailForm.subject}
                onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                placeholder="Email subject line"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email-message">Message *</Label>
              <Textarea
                id="email-message"
                value={emailForm.message}
                onChange={e => setEmailForm({ ...emailForm, message: e.target.value })}
                placeholder="Enter your email message here..."
                rows={8}
                required
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2 flex-1">
              <Button 
                variant="outline" 
                onClick={handleOpenEmailClient}
                className="gap-2 flex-1"
                title="Open in your email client"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Email Client
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCopyEmailDetails}
                className="gap-2"
                title="Copy email details to clipboard"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={sendingEmail} className="gap-2">
                {sendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Send via System
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
