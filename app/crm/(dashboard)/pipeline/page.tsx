import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { KanbanSquare, Plus } from 'lucide-react'
import Link from 'next/link'

const pipelineStages = [
  {
    name: 'Leads',
    description: 'New inquiries awaiting first contact',
    sla: 'Contact within 24h',
    href: '#leads'
  },
  {
    name: 'Tour Scheduled',
    description: 'Tours booked and awaiting attendance',
    sla: 'Confirm 24h before',
    href: '#tour-scheduled'
  },
  {
    name: 'Applications',
    description: 'Prospects working through paperwork',
    sla: 'Follow-up every 48h',
    href: '#applications'
  },
  {
    name: 'Enrollment',
    description: 'Ready to deposit and choose cohort',
    sla: 'Close within 72h',
    href: '#enrollment'
  }
]

export default function CrmPipelinePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Badge variant="outline" className="border-slate-300 text-slate-600">CRM</Badge>
        <h1 className="text-3xl font-semibold text-slate-900">Pipeline Overview</h1>
        <p className="text-sm text-slate-600">
          A Kanban-style board that tracks everyone from first touch through enrollment. Drag-and-drop, SLA timers, and
          automation hooks plug in here.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <KanbanSquare className="h-5 w-5 text-slate-500" />
              Pipeline Blueprint
            </CardTitle>
            <CardDescription>
              Each stage below becomes a column in the Kanban UI. Cursor can generate the board with drag-and-drop + optimistic mutations.
            </CardDescription>
          </div>
          <Link
            href="/crm/contacts"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
            Add New Lead
          </Link>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pipelineStages.map(stage => (
            <div key={stage.name} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{stage.name}</h3>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">{stage.sla}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">{stage.description}</p>
              <Link
                href={stage.href}
                className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View sample cards →
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-dashed border-slate-300 bg-white">
        <CardHeader>
          <CardTitle>Next step for the team</CardTitle>
          <CardDescription>
            Use Cursor to scaffold the drag-and-drop board. Wire it to `/api/contacts` and `/api/tours` for real time stage updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>• Build a server action that moves a contact between stages and writes a timeline entry.</p>
          <p>• Show SLA timers (e.g., “Contact overdue by 6h”) using the task model you now have.</p>
          <p>• Add filters for campus, owner, and lead source.</p>
        </CardContent>
      </Card>
    </div>
  )
}
