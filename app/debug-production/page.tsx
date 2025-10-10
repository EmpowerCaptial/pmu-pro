"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DebugProductionPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runCheck = async () => {
    setLoading(true)
    const results: any = {
      timestamp: new Date().toISOString(),
      checks: []
    }

    try {
      // Get current logged in user
      const currentUser = JSON.parse(localStorage.getItem('demoUser') || '{}')
      results.currentUser = {
        name: currentUser.name,
        email: currentUser.email,
        id: currentUser.id,
        role: currentUser.role,
        studioName: currentUser.studioName,
        businessName: currentUser.businessName
      }
      results.checks.push('✅ Got current user from localStorage')

      // Check team members
      const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]')
      results.teamMembers = teamMembers.map((m: any) => ({
        name: m.name,
        email: m.email,
        id: m.id,
        role: m.role,
        studioName: m.studioName
      }))
      results.checks.push(`✅ Found ${teamMembers.length} team members`)

      // Test API: Get services for current user
      results.checks.push('🔍 Testing /api/services with current user email...')
      const servicesResponse = await fetch('/api/services', {
        headers: { 'x-user-email': currentUser.email }
      })
      
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        results.services = {
          fromCurrentUser: servicesData.services?.map((s: any) => ({
            id: s.id,
            name: s.name,
            isActive: s.isActive
          })) || []
        }
        results.checks.push(`✅ API returned ${results.services.fromCurrentUser.length} services for current user`)
      } else {
        results.servicesError = `❌ API error: ${servicesResponse.status} ${servicesResponse.statusText}`
        results.checks.push(results.servicesError)
      }

      // Test API: Get services for Tyrone
      results.checks.push('🔍 Testing /api/services with Tyrone email...')
      const tyroneResponse = await fetch('/api/services', {
        headers: { 'x-user-email': 'Tyronejackboy@gmail.com' }
      })
      
      if (tyroneResponse.ok) {
        const tyroneData = await tyroneResponse.json()
        results.services = results.services || {}
        results.services.fromTyrone = tyroneData.services?.map((s: any) => ({
          id: s.id,
          name: s.name,
          isActive: s.isActive
        })) || []
        results.checks.push(`✅ API returned ${results.services.fromTyrone.length} services for Tyrone`)
      } else {
        results.tyroneError = `❌ API error: ${tyroneResponse.status}`
        results.checks.push(results.tyroneError)
      }

      // Check service assignments
      const assignments = JSON.parse(localStorage.getItem('service-assignments') || '[]')
      const jenny = teamMembers.find((m: any) => m.email === 'jenny@universalbeautystudio.com')
      
      if (jenny) {
        const jennyAssignments = assignments.filter((a: any) => 
          a.userId === jenny.id && a.assigned
        )
        results.jennyAssignments = {
          jennyId: jenny.id,
          count: jennyAssignments.length,
          serviceIds: jennyAssignments.map((a: any) => a.serviceId)
        }
        results.checks.push(`✅ Jenny has ${jennyAssignments.length} assignments`)
        
        // Check if service IDs match
        if (results.services?.fromTyrone) {
          let matches = 0
          jennyAssignments.forEach((a: any) => {
            if (results.services.fromTyrone.find((s: any) => s.id === a.serviceId)) {
              matches++
            }
          })
          results.idMatches = {
            total: jennyAssignments.length,
            matches: matches,
            percentage: Math.round((matches / jennyAssignments.length) * 100)
          }
          results.checks.push(`${matches === jennyAssignments.length ? '✅' : '❌'} Service ID matches: ${matches}/${jennyAssignments.length}`)
        }
      } else {
        results.checks.push('❌ Jenny not found in team members')
      }

    } catch (error) {
      results.error = error instanceof Error ? error.message : 'Unknown error'
      results.checks.push('❌ Error: ' + results.error)
    }

    setData(results)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🔍 Production Debug Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runCheck}
              disabled={loading}
              className="mb-6 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Running Checks...' : 'Run Full Diagnostic'}
            </Button>

            {data && (
              <div className="space-y-6">
                {/* Current User */}
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-bold mb-2">Current User</h3>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(data.currentUser, null, 2)}
                  </pre>
                </div>

                {/* Checks */}
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-bold mb-2">Checks</h3>
                  {data.checks.map((check: string, i: number) => (
                    <div 
                      key={i} 
                      className={`text-sm py-1 ${
                        check.includes('✅') ? 'text-green-700' : 
                        check.includes('❌') ? 'text-red-700' : 
                        'text-gray-700'
                      }`}
                    >
                      {check}
                    </div>
                  ))}
                </div>

                {/* Services */}
                {data.services && (
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-bold mb-2">Services from API</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold mb-2">From Current User ({data.services.fromCurrentUser?.length || 0}):</p>
                        <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-60">
                          {JSON.stringify(data.services.fromCurrentUser, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-2">From Tyrone ({data.services.fromTyrone?.length || 0}):</p>
                        <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-60">
                          {JSON.stringify(data.services.fromTyrone, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* ID Match Analysis */}
                {data.idMatches && (
                  <div className={`p-4 rounded-lg border-2 ${
                    data.idMatches.matches === data.idMatches.total 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-red-50 border-red-300'
                  }`}>
                    <h3 className="font-bold mb-2">
                      {data.idMatches.matches === data.idMatches.total ? '✅' : '❌'} Service ID Match Analysis
                    </h3>
                    <p className="text-sm">
                      Jenny's assignments match production services: <strong>{data.idMatches.matches}/{data.idMatches.total} ({data.idMatches.percentage}%)</strong>
                    </p>
                  </div>
                )}

                {/* Full Data */}
                <details className="bg-white p-4 rounded-lg border">
                  <summary className="font-bold cursor-pointer">Full Raw Data (Click to expand)</summary>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto mt-2 max-h-96">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


