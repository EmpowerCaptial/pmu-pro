'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckSquare } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'

const AUTHORIZED_ROLES = ['owner', 'staff', 'manager', 'director']

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

export default function CrmTasksPage() {
  const { currentUser } = useDemoAuth()
  const role = currentUser?.role?.toLowerCase() ?? ''
  const canAccess = AUTHORIZED_ROLES.includes(role)

  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [scope, setScope] = useState<'mine' | 'all'>('mine')
  const [statusFilter, setStatusFilter] = useState<'OPEN' | 'DONE' | 'SNOOZED' | 'ALL'>('OPEN')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser?.email || !canAccess) return
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email, scope, statusFilter, canAccess])

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'ALL') return tasks
    return tasks.filter(task => task.status === statusFilter)
  }, [tasks, statusFilter])

  const fetchTasks = async () => {
    if (!currentUser?.email) return
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ scope })
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      const response = await fetch(`/api/crm/tasks?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        }
      })
      if (!response.ok) {
        throw new Error('Failed to load tasks')
      }
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (err) {
      console.error(err)
      setError('Unable to load tasks. Please retry.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (taskId: string, status: string) => {
    if (!currentUser?.email) return
    try {
      const response = await fetch(`/api/crm/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({ status })
      })
      if (!response.ok) {
        throw new Error('Failed to update task')
      }
      fetchTasks()
    } catch (err) {
      console.error(err)
      setError('Unable to update task status.')
    }
  }

  if (!canAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CRM Access Required</CardTitle>
          <CardDescription>Only staff or owners can manage follow-up tasks.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Task Queue</h1>
        <p className="text-sm text-slate-600">
          Track SLAs and follow-ups. Complete tasks when done, or snooze them to revisit later.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <CheckSquare className="h-5 w-5 text-slate-500" />
              Workload Snapshot
            </CardTitle>
            <CardDescription>
              Filter by ownership or status. Automations will add tasks for tours, applications, and nurture cadences.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={scope} onValueChange={value => setScope(value as 'mine' | 'all')}>
              <SelectTrigger className="sm:w-40">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mine">My tasks</SelectItem>
                <SelectItem value="all">All tasks</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={value => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger className="sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="SNOOZED">Snoozed</SelectItem>
                <SelectItem value="DONE">Completed</SelectItem>
                <SelectItem value="ALL">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          )}
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">No tasks in this view.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredTasks.map(task => (
                <div key={task.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{task.title}</p>
                      <p className="text-xs text-slate-500">
                        {task.dueAt ? `Due ${new Date(task.dueAt).toLocaleString()}` : 'No due date'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs uppercase tracking-wide">
                      {task.status}
                    </Badge>
                  </div>
                  {task.contact && (
                    <p className="mt-2 text-xs text-slate-600">
                      Contact: {task.contact.firstName} {task.contact.lastName} ({task.contact.stage})
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    {task.status !== 'DONE' && (
                      <Button variant="secondary" size="sm" onClick={() => handleStatusChange(task.id, 'DONE')}>
                        Mark done
                      </Button>
                    )}
                    {task.status !== 'SNOOZED' && (
                      <Button variant="outline" size="sm" onClick={() => handleStatusChange(task.id, 'SNOOZED')}>
                        Snooze 24h
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
