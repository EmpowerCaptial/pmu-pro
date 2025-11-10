import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckSquare, RefreshCcw } from 'lucide-react'

export default function CrmTasksPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Task Queue</h1>
        <p className="text-sm text-slate-600">
          Manage follow-ups, SLA timers, snoozes, and owner assignments for every contact in the pipeline.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <CheckSquare className="h-5 w-5 text-slate-500" />
              Workload Snapshot
            </CardTitle>
            <CardDescription>
              Build this out with filters for owner, due date, priority, and SLA status. Integrate with the `Task` model.
            </CardDescription>
          </div>
          <Button variant="outline" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Sync automations
          </Button>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>• List overdue tasks with badges (e.g., &quot;6h overdue&quot;).</p>
          <p>• Provide quick-complete and snooze buttons, with optimistic UI.</p>
          <p>• Trigger templates: voice script, SMS, email, or note.</p>
        </CardContent>
      </Card>
    </div>
  )
}
