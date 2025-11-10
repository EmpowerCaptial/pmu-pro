import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Inbox } from 'lucide-react'

export default function CrmInboxPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Shared Inbox</h1>
        <p className="text-sm text-slate-600">
          One stream for SMS, email, and voice notes. Thread them by contact and sync to interaction history automatically.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Inbox className="h-5 w-5 text-slate-500" />
            Unified communications feed
          </CardTitle>
          <CardDescription>
            Connect Twilio, SendGrid, and your dialer webhooks to append messages to the `Interaction` table in real time.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>• Build list view with filters (My conversations, Unassigned, Needs reply).</p>
          <p>• Compose panel with templates/snippets and token replacement.</p>
          <p>• Auto-assign owner when someone responds or mark resolved when complete.</p>
        </CardContent>
      </Card>
    </div>
  )
}
