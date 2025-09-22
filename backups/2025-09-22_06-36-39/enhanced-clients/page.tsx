"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  Plus,
  Search,
  Filter,
  BarChart3,
  DollarSign,
  Target,
  Clock,
  User,
  Send
} from 'lucide-react'
import { NavBar } from '@/components/ui/navbar'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import PipelineBoard from '@/components/pipeline/pipeline-board'
import AIInsightsDashboard from '@/components/ai/ai-insights-dashboard'
import { 
  getEnhancedClients, 
  moveClientToStage, 
  addPipelineNote, 
  updateClientPipeline,
  getPipelineStats,
  getClientsNeedingFollowUp
} from '@/lib/enhanced-client-service'
import { ClientPortalService } from '@/lib/client-portal-service'
import { EnhancedClientProfile, PipelineStage } from '@/types/client-pipeline'

export default function EnhancedClientsPage() {
  const { currentUser } = useDemoAuth()
  const [clients, setClients] = useState<EnhancedClientProfile[]>([])
  const [stats, setStats] = useState<any>(null)
  const [followUpClients, setFollowUpClients] = useState<EnhancedClientProfile[]>([])
  const [activeTab, setActiveTab] = useState('pipeline')

  useEffect(() => {
    // Load enhanced clients
    const enhancedClients = getEnhancedClients()
    setClients(enhancedClients)
    
    // Load pipeline statistics
    const pipelineStats = getPipelineStats()
    setStats(pipelineStats)
    
    // Load clients needing follow-up
    const followUp = getClientsNeedingFollowUp()
    setFollowUpClients(followUp)
  }, [])

  const handleClientMove = (clientId: string, newStage: PipelineStage) => {
    const updatedClient = moveClientToStage(clientId, newStage)
    if (updatedClient) {
      setClients(prev => prev.map(client => 
        client.id === clientId ? updatedClient : client
      ))
      
      // Update stats
      const newStats = getPipelineStats()
      setStats(newStats)
    }
  }

  const handleAddNote = (clientId: string, note: string) => {
    const updatedClient = addPipelineNote(clientId, note, currentUser?.name || 'Artist')
    if (updatedClient) {
      setClients(prev => prev.map(client => 
        client.id === clientId ? updatedClient : client
      ))
    }
  }

  const handleUpdatePipeline = (clientId: string, updates: any) => {
    const updatedClient = updateClientPipeline(clientId, updates)
    if (updatedClient) {
      setClients(prev => prev.map(client => 
        client.id === clientId ? updatedClient : client
      ))
      
      // Update stats
      const newStats = getPipelineStats()
      setStats(newStats)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(0)}%`
  }

  const handleAddNewClient = () => {
    // Navigate to the new client form
    window.location.href = '/clients/new'
  }

  const handleSendPortalAccess = () => {
    // Show a modal or alert to select a client for portal access
    const selectedClientId = prompt('Enter client ID to send portal access (1-7):')
    if (selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId)
      if (client) {
        const portalService = ClientPortalService.getInstance()
        const portalUser = portalService.createPortalAccess(client)
        const portalLink = portalService.generatePortalAccessLink(client.id)
        alert(`Portal access link for ${client.firstName} ${client.lastName}:\n\n${window.location.origin}${portalLink}`)
      } else {
        alert('Client not found. Please enter a valid client ID (1-7).')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={currentUser || undefined} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enhanced Client Management</h1>
              <p className="text-gray-600 mt-2">Advanced CRM with pipeline management and analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="bg-white border-lavender text-lavender hover:bg-lavender hover:text-white"
                onClick={handleSendPortalAccess}
              >
                <User className="h-4 w-4 mr-2" />
                Send Portal Access
              </Button>
              <Button className="bg-lavender hover:bg-lavender/90 text-white" onClick={handleAddNewClient}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Client
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Clients</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalClients}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Pipeline Value</p>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalValue)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Avg Probability</p>
                    <p className="text-2xl font-bold text-purple-900">{formatPercentage(stats.avgProbability)}</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Need Follow-up</p>
                    <p className="text-2xl font-bold text-orange-900">{followUpClients.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 bg-white border border-gray-200 shadow-sm">
            <TabsTrigger value="pipeline" className="text-xs md:text-sm data-[state=active]:bg-lavender data-[state=active]:text-white">Pipeline Board</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs md:text-sm data-[state=active]:bg-lavender data-[state=active]:text-white">Analytics</TabsTrigger>
            <TabsTrigger value="ai-insights" className="text-xs md:text-sm data-[state=active]:bg-lavender data-[state=active]:text-white">AI Insights</TabsTrigger>
            <TabsTrigger value="followup" className="text-xs md:text-sm data-[state=active]:bg-lavender data-[state=active]:text-white">Follow-ups</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="space-y-6">
            <PipelineBoard
              clients={clients}
              onClientMove={handleClientMove}
              onAddNote={handleAddNote}
              onUpdatePipeline={handleUpdatePipeline}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stage Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Pipeline Stage Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats && Object.entries(stats.byStage).map(([stage, data]: [string, any]) => (
                    <div key={stage} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-lavender"></div>
                        <span className="capitalize">{stage}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{data.count} clients</div>
                        <div className="text-sm text-gray-600">{formatCurrency(data.value)}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Revenue Forecast */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>High Probability (&gt;75%)</span>
                      <span className="font-medium">
                        {formatCurrency(
                          clients
                            .filter(c => c.pipeline.probability > 0.75)
                            .reduce((sum, c) => sum + c.pipeline.estimatedValue, 0)
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Medium Probability (25-75%)</span>
                      <span className="font-medium">
                        {formatCurrency(
                          clients
                            .filter(c => c.pipeline.probability >= 0.25 && c.pipeline.probability <= 0.75)
                            .reduce((sum, c) => sum + c.pipeline.estimatedValue, 0)
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Low Probability (&lt;25%)</span>
                      <span className="font-medium">
                        {formatCurrency(
                          clients
                            .filter(c => c.pipeline.probability < 0.25)
                            .reduce((sum, c) => sum + c.pipeline.estimatedValue, 0)
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            <AIInsightsDashboard clients={clients} />
          </TabsContent>

          <TabsContent value="followup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Clients Needing Follow-up
                </CardTitle>
                <CardDescription>
                  {followUpClients.length} clients require attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {followUpClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">
                          {client.firstName} {client.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{client.email}</p>
                        <p className="text-sm text-gray-500">
                          Follow-up due: {client.pipeline.followUpDate?.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="capitalize">
                          {client.pipeline.stage}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {client.pipeline.nextAction}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {followUpClients.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No clients need follow-up at this time</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
