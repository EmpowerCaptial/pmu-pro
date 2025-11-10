'use client'

import { ReactNode } from 'react'
import { CrmNav } from './crm-nav'

interface CrmShellProps {
  children: ReactNode
}

export function CrmShell({ children }: CrmShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-16 pt-8 lg:flex-row lg:gap-10 lg:pt-12">
        <aside className="lg:w-64 lg:shrink-0">
          <CrmNav />
        </aside>
        <main className="flex-1 space-y-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
