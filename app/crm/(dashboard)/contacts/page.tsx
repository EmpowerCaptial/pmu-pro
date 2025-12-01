'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Loader2, Users, Mail } from 'lucide-react'
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
import { Label } from '@/components/ui/label'

const STAGES = [
  { value: 'ALL', label: 'All stages' },
  { value: 'LEAD', label: 'Leads' },
  { value: 'TOUR_SCHEDULED', label: 'Tour Scheduled' },
  { value: 'TOURED', label: 'Toured' },
  { value: 'APP_STARTED', label: 'Application Started' },
  { value: 'APP_SUBMITTED', label: 'Application Submitted' },
  { value: 'ENROLLED', label: 'Enrolled' },
  { value: 'NO_SHOW', label: 'No-Show' },
  { value: 'NURTURE', label: 'Nurture' }
] as const

interface ContactRow {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  stage: string
  source?: string | null
  owner?: {
    id: string
    name: string
    email: string
  } | null
  tasks: { id: string; status: string }[]
  interactions: {
    id: string
    type: string
    direction: string
    subject: string | null
    createdAt: string
  }[]
}

const AUTHORIZED_ROLES = ['owner', 'staff', 'manager', 'director']

type StageFilter = (typeof STAGES)[number]['value']

export default function CrmContactsPage() {
  const { currentUser } = useDemoAuth()
  const role = currentUser?.role?.toLowerCase() ?? ''
  const canAccess = AUTHORIZED_ROLES.includes(role)

  const [contacts, setContacts] = useState<ContactRow[]>([])
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<StageFilter>('ALL')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ContactRow | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: ''
  })

  useEffect(() => {
    if (!currentUser?.email || !canAccess) return
    fetchContacts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email, stageFilter, canAccess])

  const filteredContacts = useMemo(() => {
    if (!search) return contacts
    return contacts.filter(contact => {
      const haystack = [
        contact.firstName,
        contact.lastName,
        contact.email,
        contact.phone,
        contact.source,
        contact.owner?.name
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(search.toLowerCase())
    })
  }, [contacts, search])

  const fetchContacts = async () => {
    if (!currentUser?.email) return
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (stageFilter !== 'ALL') params.set('stage', stageFilter)
      const response = await fetch(`/api/crm/contacts?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        }
      })
      if (!response.ok) {
        throw new Error('Failed to load contacts')
      }
      const data = await response.json()
      setContacts(data.contacts || [])
    } catch (err) {
      console.error(err)
      setError('Unable to load contacts. Please retry.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenEmailDialog = (contact: ContactRow) => {
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
      await fetchContacts() // Refresh to show new interaction
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unable to send email')
    } finally {
      setSendingEmail(false)
    }
  }

  if (!canAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CRM Access Required</CardTitle>
          <CardDescription>Only staff or owners can manage contacts.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Contacts</h1>
        <p className="text-sm text-slate-600">
          Search, segment, and manage prospects. Click into a record to see the unified timeline and enrollment progress.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <Users className="h-5 w-5 text-slate-500" />
              Contact Directory
            </CardTitle>
            <CardDescription>
              Filter by stage or run a quick search. Bulk actions and saved filters will be layered in next.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={event => setSearch(event.target.value)}
              className="w-full sm:w-64"
            />
            <Select value={stageFilter} onValueChange={value => setStageFilter(value as StageFilter)}>
              <SelectTrigger className="sm:w-52">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map(stage => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchContacts} className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Name</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Stage</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Owner</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Source</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Last Touch</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Open Tasks</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredContacts.map(contact => (
                <tr key={contact.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-900">{`${contact.firstName} ${contact.lastName}`}</div>
                    <div className="text-xs text-slate-500">{contact.email || 'No email'} • {contact.phone || 'No phone'}</div>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="text-xs uppercase tracking-wide">
                      {contact.stage.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{contact.owner?.name || 'Unassigned'}</td>
                  <td className="px-3 py-2 text-slate-600">{contact.source || '—'}</td>
                  <td className="px-3 py-2 text-slate-600">
                    {contact.interactions[0]
                      ? `${contact.interactions[0].type} • ${new Date(contact.interactions[0].createdAt).toLocaleDateString()}`
                      : 'No activity'}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{contact.tasks.length}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
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
                      <Button asChild variant="link" className="text-blue-600">
                        <Link href={`/crm/contacts/${contact.id}`}>Open</Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && filteredContacts.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-500">No contacts match the current filters.</div>
          )}
        </CardContent>
      </Card>

      {/* Send Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Email to {selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : 'Contact'}</DialogTitle>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={sendingEmail} className="gap-2">
              {sendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
