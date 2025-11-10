'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Inbox, Send } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'

const AUTHORIZED_ROLES = ['owner', 'staff', 'manager', 'director']

interface InteractionRow {
  id: string
  type: string
  direction: string
  subject: string | null
  body: string | null
  createdAt: string
  contact: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    stage: string
  }
  staff?: {
    id: string
    name: string
    email: string
  } | null
}

interface ComposeState {
  contactId: string
  type: 'SMS' | 'EMAIL' | 'NOTE'
  direction: 'IN' | 'OUT'
  subject: string
  body: string
}

export default function CrmInboxPage() {
  const { currentUser } = useDemoAuth()
  const role = currentUser?.role?.toLowerCase() ?? ''
  const canAccess = AUTHORIZED_ROLES.includes(role)

  const [interactions, setInteractions] = useState<InteractionRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [compose, setCompose] = useState<ComposeState>({
    contactId: '',
    type: 'SMS',
    direction: 'OUT',
    subject: '',
    body: ''
  })

  useEffect(() => {
    if (!currentUser?.email || !canAccess) return
    fetchInteractions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email, canAccess])

  const fetchInteractions = async () => {
    if (!currentUser?.email) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/crm/interactions?limit=100', {
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        }
      })
      if (!response.ok) {
        throw new Error('Failed to load inbox feed')
      }
      const data = await response.json()
      setInteractions(data.interactions || [])
      if (data.interactions?.length && !compose.contactId) {
        setCompose(prev => ({ ...prev, contactId: data.interactions[0].contact.id }))
      }
    } catch (err) {
      console.error(err)
      setError('Unable to load messages. Please retry.')
    } finally {
      setIsLoading(false)
    }
  }

  const contactOptions = interactions.reduce<Record<string, { label: string; email: string | null }>>((acc, interaction) => {
    const contact = interaction.contact
    if (!acc[contact.id]) {
      acc[contact.id] = {
        label: `${contact.firstName} ${contact.lastName}`.trim(),
        email: contact.email
      }
    }
    return acc
  }, {})

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentUser?.email || !compose.contactId) return

    try {
      const response = await fetch(`/api/crm/contacts/${compose.contactId}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          type: compose.type,
          direction: compose.direction,
          subject: compose.subject,
          body: compose.body
        })
      })
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      setCompose(prev => ({ ...prev, subject: '', body: '' }))
      fetchInteractions()
    } catch (err) {
      console.error(err)
      setError('Unable to send message.')
    }
  }

  if (!canAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CRM Access Required</CardTitle>
          <CardDescription>Only staff or owners can view the unified inbox.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Shared Inbox</h1>
        <p className="text-sm text-slate-600">
          View inbound and outbound emails, SMS, and notes. Connect Twilio or SendGrid to auto-ingest replies.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Compose Reply</CardTitle>
          <CardDescription>Reply to a contact via SMS, email, or log an internal note.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSend}>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600" htmlFor="compose-contact">Contact</label>
              <Select
                value={compose.contactId}
                onValueChange={value => setCompose(prev => ({ ...prev, contactId: value }))}
              >
                <SelectTrigger id="compose-contact" className="w-full">
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(contactOptions).map(([id, option]) => (
                    <SelectItem key={id} value={id}>
                      {option.label} {option.email ? `(${option.email})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600" htmlFor="compose-type">Channel</label>
              <Select
                value={compose.type}
                onValueChange={value => setCompose(prev => ({ ...prev, type: value as ComposeState['type'] }))}
              >
                <SelectTrigger id="compose-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="NOTE">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600" htmlFor="compose-direction">Direction</label>
              <Select
                value={compose.direction}
                onValueChange={value => setCompose(prev => ({ ...prev, direction: value as ComposeState['direction'] }))}
              >
                <SelectTrigger id="compose-direction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OUT">Outbound</SelectItem>
                  <SelectItem value="IN">Inbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600" htmlFor="compose-subject">Subject</label>
              <Input
                id="compose-subject"
                value={compose.subject}
                onChange={event => setCompose(prev => ({ ...prev, subject: event.target.value }))}
                placeholder="Subject or call summary"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-slate-600" htmlFor="compose-body">Message</label>
              <Textarea
                id="compose-body"
                rows={4}
                value={compose.body}
                onChange={event => setCompose(prev => ({ ...prev, body: event.target.value }))}
                placeholder="Write your reply or note"
                required
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" className="gap-2" disabled={!compose.contactId || !compose.body}>
                <Send className="h-4 w-4" /> Send
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <Inbox className="h-5 w-5 text-slate-500" />
              Unified communications feed
            </CardTitle>
            <CardDescription>Latest 100 interactions. Filter and bulk actions coming later.</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            Total messages: {interactions.length}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          )}
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading interactions...
            </div>
          ) : interactions.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">No interactions yet.</div>
          ) : (
            <div className="space-y-3">
              {interactions.map(interaction => (
                <div key={interaction.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between text-xs text-slate-500">
                    <span>{new Date(interaction.createdAt).toLocaleString()}</span>
                    <span>{interaction.staff?.name || 'System'}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <Badge variant="outline" className="text-xs uppercase tracking-wide">
                      {interaction.type}
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                      {interaction.direction === 'IN' ? 'Inbound' : 'Outbound'}
                    </Badge>
                    <span>{interaction.contact.firstName} {interaction.contact.lastName}</span>
                    <span className="text-slate-400">({interaction.contact.stage})</span>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {interaction.subject || 'No subject'}
                  </div>
                  {interaction.body && (
                    <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">{interaction.body}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
