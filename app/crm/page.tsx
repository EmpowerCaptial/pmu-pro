"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, CalendarDays, CheckSquare, Users, BarChart3 } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'

const AUTHORIZED_ROLES = ['owner', 'staff', 'manager', 'director', 'instructor']

interface SummaryResponse {
  contactsByStage: Record<string, number>
  toursByStatus: Record<string, number>
  tasksByStatus: Record<string, number>
  enrollments: number
  upcomingTours: number
  interactionSummary: {
    total: number
    lastActivityAt: string | null
  }
}

interface TourRow {
  id: string
  start: string
  status: string
  location: string | null
  contact: {
    id: string
    firstName: string
    lastName: string
    email: string | null
  }
}

interface TaskRow {
  id: string
  title: string
  dueAt: string | null
  status: string
  contact?: {
    id: string
    firstName: string
    lastName: string
    stage: string
  } | null
}

export default function CrmDashboardPage() {
  const { currentUser } = useDemoAuth()
  const role = currentUser?.role?.toLowerCase() ?? ''
  const canAccess = AUTHORIZED_ROLES.includes(role)

  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [tours, setTours] = useState<TourRow[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser?.email || !canAccess) return
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email, canAccess])

  const loadDashboard = async () => {
    if (!currentUser?.email) return
    setIsLoading(true)
    setError(null)
    try {
      const [summaryRes, toursRes, tasksRes] = await Promise.all([
        fetch('/api/crm/reports/summary', {
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email
          }
        }),
        fetch('/api/crm/tours?range=upcoming', {
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email
          }
        }),
        fetch('/api/crm/tasks?scope=mine&status=OPEN', {
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email
          }
        })
      ])

      const failed = !summaryRes.ok ? summaryRes : !toursRes.ok ? toursRes : !tasksRes.ok ? tasksRes : null
      if (failed) {
        const errData = await failed.json().catch(() => ({}))
        const msg = (errData && typeof errData === 'object' && 'error' in errData ? errData.error : null) || 'Failed to load dashboard data'
        if (failed.status === 401) {
          throw new Error('Session expired or access denied. Please log out and log in again to view the CRM.')
        }
        if (failed.status === 403) {
          throw new Error('You don’t have permission to view the CRM. Contact your administrator.')
        }
        throw new Error(msg)
      }

      const [summaryJson, toursJson, tasksJson] = await Promise.all([
        summaryRes.json(),
        toursRes.json(),
        tasksRes.json()
      ])

      setSummary(summaryJson)
      setTours(toursJson.tours || [])
      setTasks(tasksJson.tasks?.slice(0, 5) || [])
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unable to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const totalContacts = useMemo(() => {
    if (!summary) return 0
    return Object.values(summary.contactsByStage).reduce((sum, value) => sum + value, 0)
  }, [summary])

  if (!canAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CRM Access Required</CardTitle>
          <CardDescription>Only staff or owners can view the Studio CRM.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Badge variant="outline" className="border-slate-300 text-slate-600">CRM</Badge>
        <h1 className="text-3xl font-semibold text-slate-900">Studio CRM Overview</h1>
        <p className="text-sm text-slate-600">
          Monitor pipeline health, upcoming tours, and your next follow-ups. All metrics update in real time as you and your team work the funnel.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <BarChart3 className="h-5 w-5 text-slate-500" />
              Key Metrics
            </CardTitle>
            <CardDescription>Pipeline totals, upcoming tours, and engagement.</CardDescription>
          </div>
          <Button variant="outline" onClick={loadDashboard} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Loader2 className="h-4 w-4" />} Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && !summary ? (
            <div className="flex h-32 items-center justify-center text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading metrics...
            </div>
          ) : summary ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DashboardStat
                title="Contacts in pipeline"
                value={totalContacts}
                description="Across all stages"
                badgeLabel={`${summary.upcomingTours} tours scheduled`}
              />
              <DashboardStat
                title="Active tasks"
                value={summary.tasksByStatus.OPEN ?? 0}
                description={`${summary.tasksByStatus.SNOOZED ?? 0} snoozed, ${summary.tasksByStatus.DONE ?? 0} completed`}
                badgeLabel="Stay within SLAs"
              />
              <DashboardStat
                title="Enrollments"
                value={summary.enrollments}
                description="Converted students"
                badgeLabel="Updated live"
              />
              <DashboardStat
                title="Interactions logged"
                value={summary.interactionSummary.total}
                description={summary.interactionSummary.lastActivityAt ? `Last touch ${new Date(summary.interactionSummary.lastActivityAt).toLocaleString()}` : 'No interactions yet'}
                badgeLabel="Inbox volume"
              />
            </div>
          ) : (
            <div className="text-sm text-slate-500">No summary data yet.</div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                <CalendarDays className="h-4 w-4 text-slate-500" /> Upcoming Tours
              </CardTitle>
              <CardDescription>Keep an eye on the next visits.</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs uppercase tracking-wide">{tours.length} upcoming</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && !tours.length ? (
              <div className="flex h-24 items-center justify-center text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading tours...
              </div>
            ) : tours.length === 0 ? (
              <div className="text-sm text-slate-500">No tours scheduled.</div>
            ) : (
              tours.slice(0, 5).map(tour => (
                <div key={tour.id} className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">
                    {tour.contact.firstName} {tour.contact.lastName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(tour.start).toLocaleString()} • {tour.location || 'No location'}
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs uppercase tracking-wide">
                    {tour.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                <CheckSquare className="h-4 w-4 text-slate-500" /> My Open Tasks
              </CardTitle>
              <CardDescription>Top five follow-ups assigned to you.</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs uppercase tracking-wide">{tasks.length} task(s)</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && !tasks.length ? (
              <div className="flex h-24 items-center justify-center text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-sm text-slate-500">No open tasks. Great job!</div>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                  <p className="text-xs text-slate-500">
                    {task.dueAt ? `Due ${new Date(task.dueAt).toLocaleString()}` : 'No due date'}
                  </p>
                  {task.contact && (
                    <p className="mt-1 text-xs text-slate-600">
                      Contact: {task.contact.firstName} {task.contact.lastName} ({task.contact.stage})
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {summary && (
        <Card className="border-dashed border-slate-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Users className="h-4 w-4 text-slate-500" /> Pipeline by Stage
            </CardTitle>
            <CardDescription>Snapshot of where each prospect sits today.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 text-sm text-slate-600">
            {Object.entries(summary.contactsByStage).map(([stage, count]) => (
              <Badge key={stage} variant="secondary" className="bg-slate-100 text-slate-700">
                {stage.replace('_', ' ')}: {count}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface DashboardStatProps {
  title: string
  value: number
  description: string
  badgeLabel: string
}

function DashboardStat({ title, value, description, badgeLabel }: DashboardStatProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{description}</p>
      <Badge variant="outline" className="mt-3 text-xs uppercase tracking-wide text-slate-600">
        {badgeLabel}
      </Badge>
    </div>
  )
}
