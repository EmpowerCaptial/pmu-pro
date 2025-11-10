'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, BarChart3 } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'

const AUTHORIZED_ROLES = ['owner', 'staff', 'manager', 'director']

interface ReportsSummary {
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

export default function CrmReportsPage() {
  const { currentUser } = useDemoAuth()
  const role = currentUser?.role?.toLowerCase() ?? ''
  const canAccess = AUTHORIZED_ROLES.includes(role)

  const [summary, setSummary] = useState<ReportsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser?.email || !canAccess) return
    fetchSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email, canAccess])

  const fetchSummary = async () => {
    if (!currentUser?.email) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/crm/reports/summary', {
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        }
      })
      if (!response.ok) {
        throw new Error('Failed to load report summary')
      }
      const data = await response.json()
      setSummary(data)
    } catch (err) {
      console.error(err)
      setError('Unable to load reporting data.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!canAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CRM Access Required</CardTitle>
          <CardDescription>Only leadership or staff can view growth analytics.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Revenue & Performance Reports</h1>
        <p className="text-sm text-slate-600">
          Track pipeline health, tour performance, and enrollment progress. Tailor these tiles to match your KPIs.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <BarChart3 className="h-5 w-5 text-slate-500" />
            Reporting Summary
          </CardTitle>
          <CardDescription>Data updates live as you interact with the CRM.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          )}
          {isLoading || !summary ? (
            <div className="flex h-40 items-center justify-center text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading metrics...
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">Pipeline</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{Object.values(summary.contactsByStage).reduce((sum, count) => sum + count, 0)}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  {Object.entries(summary.contactsByStage).map(([stage, count]) => (
                    <Badge key={stage} variant="outline" className="text-xs">
                      {stage.replace('_', ' ')}: {count}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">Tours</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.upcomingTours} upcoming</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  {Object.entries(summary.toursByStatus).map(([status, count]) => (
                    <Badge key={status} variant="outline" className="text-xs">
                      {status}: {count}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">Engagement</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.interactionSummary.total} touches</p>
                <p className="text-xs text-slate-500">
                  Last activity:{' '}
                  {summary.interactionSummary.lastActivityAt
                    ? new Date(summary.interactionSummary.lastActivityAt).toLocaleString()
                    : '—'}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">Tasks</p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-600">
                  {Object.entries(summary.tasksByStatus).map(([status, count]) => (
                    <Badge key={status} variant="outline" className="text-xs">
                      {status}: {count}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">Enrollments</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.enrollments}</p>
                <p className="text-xs text-slate-500">Total students converted</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
