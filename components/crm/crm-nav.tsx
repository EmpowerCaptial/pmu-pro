'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  Inbox,
  KanbanSquare,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    label: 'Pipeline',
    href: '/crm/pipeline',
    icon: KanbanSquare
  },
  {
    label: 'Contacts',
    href: '/crm/contacts',
    icon: Users
  },
  {
    label: 'Tasks',
    href: '/crm/tasks',
    icon: CheckSquare
  },
  {
    label: 'Calendar',
    href: '/crm/calendar',
    icon: CalendarDays
  },
  {
    label: 'Inbox',
    href: '/crm/inbox',
    icon: Inbox
  },
  {
    label: 'Reports',
    href: '/crm/reports',
    icon: BarChart3
  }
] as const

export function CrmNav() {
  const pathname = usePathname()

  return (
    <nav className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Studio CRM</div>
        <h2 className="text-lg font-semibold text-slate-900">Growth Operations</h2>
        <p className="mt-1 text-sm text-slate-500">
          Track leads, tours, and enrollments across your funnel.
        </p>
      </div>
      <ul className="flex flex-col px-2 py-3 text-sm">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 transition-colors',
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
