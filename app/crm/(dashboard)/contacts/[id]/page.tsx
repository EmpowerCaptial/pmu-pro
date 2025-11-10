import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, UserSquare2 } from 'lucide-react'

interface ContactDetailPageProps {
  params: {
    id: string
  }
}

export default function ContactDetailPage({ params }: ContactDetailPageProps) {
  const contactId = params?.id

  if (!contactId) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Badge variant="outline" className="border-slate-300 text-slate-600">Contact</Badge>
        <h1 className="text-3xl font-semibold text-slate-900">Contact Timeline Placeholder</h1>
        <p className="text-sm text-slate-600">
          This page will load contact <span className="font-mono text-xs">{contactId}</span>, show profile info, unified timeline, tasks,
          application progress, and quick actions.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <UserSquare2 className="h-5 w-5 text-slate-500" />
              Profile Summary
            </CardTitle>
            <CardDescription>Replace this card with contact metadata and quick actions.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>• Enrollment readiness score</p>
            <p>• Consent history (SMS / Email)</p>
            <p>• Upcoming tasks & tours</p>
            <p>• Tags, source, referrer</p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-slate-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <History className="h-5 w-5 text-slate-500" />
              Timeline Feed (coming soon)
            </CardTitle>
            <CardDescription>
              Hydrate this with the `Interaction` model and allow posting notes, SMS, emails, and call logs.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>• Server action to add a note and refresh the feed.</p>
            <p>• Tabs for Timeline / Tasks / Documents.</p>
            <p>• Right-hand drawer for application checklist.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
