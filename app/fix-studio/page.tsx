"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export default function FixStudioPage() {
  const [status, setStatus] = useState<string[]>([])
  const [isFixed, setIsFixed] = useState(false)

  const addStatus = (msg: string) => {
    setStatus(prev => [...prev, msg])
  }

  const runAutoFix = () => {
    addStatus('🔧 Starting automatic fix...')
    
    try {
      const studioName = 'Universal Beauty Studio Academy'
      const businessName = 'Universal Beauty Studio - Tyrone Jackson'
      
      // Fix 1: Update current user
      const demoUser = localStorage.getItem('demoUser')
      if (demoUser) {
        const user = JSON.parse(demoUser)
        user.studioName = studioName
        user.businessName = businessName
        localStorage.setItem('demoUser', JSON.stringify(user))
        addStatus('✅ Updated current user studio names')
      }
      
      // Fix 2: Update ALL team members
      const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]')
      let updated = 0
      teamMembers.forEach((m: any) => {
        if (!m.studioName || m.studioName === 'NOT SET') {
          m.studioName = studioName
          updated++
        }
        if (!m.businessName) {
          m.businessName = businessName
        }
      })
      localStorage.setItem('studio-team-members', JSON.stringify(teamMembers))
      addStatus(`✅ Updated ${updated} team members with studio names`)
      
      // Fix 3: Show Jenny's assignments
      const assignments = JSON.parse(localStorage.getItem('service-assignments') || '[]')
      const jennyAssignments = assignments.filter((a: any) => {
        const jenny = teamMembers.find((m: any) => m.email === 'jenny@universalbeautystudio.com')
        return jenny && a.userId === jenny.id && a.assigned
      })
      
      addStatus(`✅ Jenny has ${jennyAssignments.length} services assigned`)
      
      // Fix 4: Sync instructors from team members
      const instructorMembers = teamMembers.filter((m: any) => 
        (m.role === 'instructor' || m.role === 'licensed' || m.role === 'owner') &&
        m.status === 'active'
      )
      
      const studioInstructors = instructorMembers.map((m: any) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        specialty: 'PMU Specialist',
        experience: '5+ years',
        rating: 4.8,
        location: studioName,
        phone: m.phone || '',
        avatar: m.avatar || null,
        licenseNumber: m.licenseNumber || `LIC-${m.id.slice(-6)}`
      }))
      
      localStorage.setItem('studio-instructors', JSON.stringify(studioInstructors))
      localStorage.setItem('supervisionInstructors', JSON.stringify(studioInstructors))
      addStatus(`✅ Synced ${studioInstructors.length} instructors to supervision`)
      
      setIsFixed(true)
      addStatus('')
      addStatus('🎉 ALL FIXES COMPLETE!')
      addStatus('')
      addStatus('Jenny can now:')
      addStatus('1. Log in with: jenny@universalbeautystudio.com')
      addStatus('2. Go to Supervision Booking')
      addStatus(`3. See ${instructorMembers.length} instructors available`)
      addStatus(`4. Select from ${jennyAssignments.length} assigned services`)
      
    } catch (error) {
      addStatus('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown'))
    }
  }

  useEffect(() => {
    // Auto-run on page load
    setTimeout(() => runAutoFix(), 500)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 to-lavender-600/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-lavender/30 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-lavender to-lavender-600 text-white">
          <CardTitle className="text-2xl text-center">
            🔧 Studio Setup Auto-Fix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-2 mb-6 bg-gray-50 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {status.length === 0 ? (
              <p className="text-gray-500">Running fixes...</p>
            ) : (
              status.map((msg, i) => (
                <div key={i} className={
                  msg.includes('✅') ? 'text-green-700' :
                  msg.includes('❌') ? 'text-red-700' :
                  msg.includes('⚠️') ? 'text-yellow-700' :
                  msg.includes('🎉') ? 'text-purple-700 font-bold' :
                  'text-gray-700'
                }>
                  {msg}
                </div>
              ))
            )}
          </div>
          
          {isFixed && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-green-900 mb-2">
                All Fixed!
              </h3>
              <p className="text-green-800 text-sm">
                Jenny can now log in and book supervision sessions with assigned services.
              </p>
            </div>
          )}
          
          {!isFixed && status.length > 0 && (
            <Button 
              onClick={() => {
                setStatus([])
                setIsFixed(false)
                runAutoFix()
              }}
              className="w-full bg-lavender hover:bg-lavender-600"
            >
              Run Fix Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

