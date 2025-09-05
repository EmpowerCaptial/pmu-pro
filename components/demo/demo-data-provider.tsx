"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Brain, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Palette,
  FileText,
  Smartphone
} from 'lucide-react'
import { 
  isDemoMode, 
  getDemoClients, 
  getDemoAnalyses,
  addDemoClient,
  addDemoAnalysis,
  getRemainingDemoTime,
  DEMO_USER 
} from '@/lib/demo-auth'

interface DemoDataProviderProps {
  children: React.ReactNode
}

export default function DemoDataProvider({ children }: DemoDataProviderProps) {
  const [demoClients, setDemoClients] = useState<any[]>([])
  const [demoAnalyses, setDemoAnalyses] = useState<any[]>([])
  const [remainingTime, setRemainingTime] = useState(0)

  useEffect(() => {
    // Only initialize demo data if in demo mode
    if (!isDemoMode()) return

    try {
      setDemoClients(getDemoClients())
      setDemoAnalyses(getDemoAnalyses())
      setRemainingTime(getRemainingDemoTime())

      const interval = setInterval(() => {
        setRemainingTime(getRemainingDemoTime())
      }, 60000) // Update every minute

      return () => clearInterval(interval)
    } catch (error) {
      console.error('Error initializing demo data:', error)
    }
  }, [])

  if (!isDemoMode()) {
    return <>{children}</>
  }

  const handleAddDemoClient = () => {
    try {
      const newClient = {
        name: `Demo Client ${demoClients.length + 1}`,
        email: `demo${demoClients.length + 1}@example.com`,
        phone: `(555) ${String(demoClients.length + 1).padStart(3, '0')}-0000`,
        skinType: ['Type II', 'Type III', 'Type IV'][demoClients.length % 3],
        undertone: ['Warm', 'Cool', 'Neutral'][demoClients.length % 3],
        lastVisit: new Date().toISOString().split('T')[0],
        status: 'Active'
      }
      addDemoClient(newClient)
      setDemoClients(getDemoClients())
    } catch (error) {
      console.error('Failed to add demo client:', error)
    }
  }

  const handleAddDemoAnalysis = () => {
    try {
      const newAnalysis = {
        clientId: demoClients[0]?.id || 'demo-1',
        type: ['Skin Analysis', 'Procell Analysis', 'Color Correction'][demoAnalyses.length % 3],
        result: `Demo Result ${demoAnalyses.length + 1}`,
        confidence: 85 + (demoAnalyses.length * 2),
        timestamp: new Date().toISOString()
      }
      addDemoAnalysis(newAnalysis)
      setDemoAnalyses(getDemoAnalyses())
    } catch (error) {
      console.error('Failed to add demo analysis:', error)
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Demo Status Banner */}
      <Alert className="border-blue-200 bg-blue-50">
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="flex items-center justify-between">
            <span className="font-medium">Demo Mode Active</span>
            <div className="flex items-center gap-4 text-sm">
              <span>Session expires in: <strong>{formatTime(remainingTime)}</strong></span>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                {demoClients.length}/{DEMO_USER.restrictions.maxClients} Clients
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                {demoAnalyses.length}/{DEMO_USER.restrictions.maxAnalyses} Analyses
              </Badge>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Demo Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demo Clients */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Demo Clients
            </CardTitle>
            <CardDescription className="text-purple-600">
              Sample client data for demonstration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoClients.map((client: any) => (
              <div key={client.id} className="bg-white p-3 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{client.name}</h4>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    {client.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{client.email}</p>
                  <p>{client.phone}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {client.skinType}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {client.undertone}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {demoClients.length < DEMO_USER.restrictions.maxClients && (
              <Button 
                onClick={handleAddDemoClient}
                variant="outline" 
                size="sm"
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                Add Demo Client
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Demo Analyses */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Demo Analyses
            </CardTitle>
            <CardDescription className="text-blue-600">
              Sample analysis results for demonstration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoAnalyses.map((analysis: any) => (
              <div key={analysis.id} className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{analysis.type}</h4>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    {analysis.confidence}%
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{analysis.result}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(analysis.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            
            {demoAnalyses.length < DEMO_USER.restrictions.maxAnalyses && (
              <Button 
                onClick={handleAddDemoAnalysis}
                variant="outline" 
                size="sm"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Add Demo Analysis
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Demo Features Grid */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Available Demo Features
          </CardTitle>
          <CardDescription className="text-green-600">
            All PMU Pro features are available for demonstration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border border-green-200">
              <Palette className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800">Skin Analysis</h4>
              <p className="text-xs text-green-600">AI-powered analysis</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-green-200">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800">Client Management</h4>
              <p className="text-xs text-green-600">Organize clients</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-green-200">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800">Resource Library</h4>
              <p className="text-xs text-green-600">Professional documents</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-green-200">
              <Smartphone className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800">Mobile PWA</h4>
              <p className="text-xs text-green-600">Install as app</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Restrictions Notice */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <div className="space-y-2">
            <p className="font-medium">Demo Mode Restrictions:</p>
            <ul className="text-sm space-y-1">
              <li>• Data is not permanently saved</li>
              <li>• Printing and export features are disabled</li>
              <li>• Session expires after 2 hours</li>
              <li>• Maximum 5 demo clients and 10 analyses</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      {children}
    </div>
  )
}
