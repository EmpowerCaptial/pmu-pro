"use client"

import { NavBar } from '@/components/ui/navbar'
import { DatabaseTimeClock } from '@/components/time-tracking/database-time-clock'
import { useDemoAuth } from '@/hooks/use-demo-auth'

export default function TimeClockPage() {
  const { currentUser } = useDemoAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <NavBar 
          currentPath="/time-clock"
          user={currentUser ? {
            name: currentUser.name,
            email: currentUser.email,
            initials: currentUser.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
            avatar: currentUser.avatar
          } : undefined} 
        />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Time Clock</h1>
            <p className="text-gray-600 mt-1">
              Track your work hours with database persistence
            </p>
          </div>
        </div>

        {/* Database Time Clock Component */}
        <DatabaseTimeClock />
      </div>
    </div>
  )
}