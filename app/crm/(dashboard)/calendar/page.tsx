import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays } from 'lucide-react'

export default function CrmCalendarPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Tour & Event Calendar</h1>
        <p className="text-sm text-slate-600">
          Map your tours, room bookings, and enrollment events across campuses. Integrate with Google Calendar or build an internal scheduler.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <CalendarDays className="h-5 w-5 text-slate-500" />
            Scheduling Roadmap
          </CardTitle>
          <CardDescription>
            Schema is ready (`Tour` model). Next, generate day/week/month views and allow drag-to-reschedule with server actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>• Pull tours, include room assignment, and show status (scheduled/attended/no-show).</p>
          <p>• Provide quick actions for check-in, reschedule, mark as no-show.</p>
          <p>• Sync reminders (24h & 2h SMS) and capture outcomes for analytics.</p>
        </CardContent>
      </Card>
    </div>
  )
}
