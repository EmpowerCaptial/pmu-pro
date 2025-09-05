"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  Target,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Lightbulb,
  BarChart3,
  Zap,
  Eye,
  Calendar,
  Star
} from 'lucide-react'
import { AIInsight, PredictionModel, SmartRecommendation, AIAnalyticsService } from '@/lib/ai-analytics-service'
import { EnhancedClientProfile } from '@/types/client-pipeline'

interface AIInsightsDashboardProps {
  clients: EnhancedClientProfile[]
}

export default function AIInsightsDashboard({ clients }: AIInsightsDashboardProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [predictions, setPredictions] = useState<Map<string, PredictionModel>>(new Map())
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([])
  const [activeTab, setActiveTab] = useState('insights')
  const [selectedClient, setSelectedClient] = useState<string | null>(null)

  const aiService = AIAnalyticsService.getInstance()

  useEffect(() => {
    // Generate AI insights
    const aiInsights = aiService.generateInsights(clients)
    setInsights(aiInsights)

    // Generate predictions
    const clientPredictions = aiService.generatePredictions(clients)
    setPredictions(clientPredictions)

    // Generate recommendations
    const smartRecs = aiService.generateRecommendations(clients)
    setRecommendations(smartRecs)
  }, [clients])

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'revenue':
        return <DollarSign className="h-5 w-5" />
      case 'retention':
        return <Users className="h-5 w-5" />
      case 'conversion':
        return <Target className="h-5 w-5" />
      case 'risk':
        return <AlertTriangle className="h-5 w-5" />
      case 'opportunity':
        return <TrendingUp className="h-5 w-5" />
      default:
        return <Lightbulb className="h-5 w-5" />
    }
  }

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'revenue':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'retention':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'conversion':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'risk':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'opportunity':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getImpactColor = (impact: AIInsight['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRecommendationIcon = (type: SmartRecommendation['type']) => {
    switch (type) {
      case 'followup':
        return <Clock className="h-4 w-4" />
      case 'upsell':
        return <ArrowUpRight className="h-4 w-4" />
      case 'retention':
        return <Star className="h-4 w-4" />
      case 'timing':
        return <Calendar className="h-4 w-4" />
      case 'procedure':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: SmartRecommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const getClientById = (clientId: string) => {
    return clients.find(c => c.id === clientId)
  }

  const highPriorityRecommendations = recommendations.filter(rec => rec.priority === 'high')
  const mediumPriorityRecommendations = recommendations.filter(rec => rec.priority === 'medium')

  return (
    <div className="space-y-6">
      {/* AI Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Insights Dashboard</h2>
            <p className="text-gray-600">Powered by machine learning for smarter business decisions</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Zap className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">AI Insights</p>
                <p className="text-2xl font-bold text-blue-900">{insights.length}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">High Priority</p>
                <p className="text-2xl font-bold text-green-900">{highPriorityRecommendations.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Retention</p>
                <p className="text-2xl font-bold text-purple-900">
                  {predictions.size > 0 
                    ? formatPercentage(
                        Array.from(predictions.values()).reduce((sum, p) => sum + p.retentionProbability, 0) / predictions.size
                      )
                    : '0%'
                  }
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg LTV</p>
                <p className="text-2xl font-bold text-orange-900">
                  {predictions.size > 0 
                    ? formatCurrency(
                        Array.from(predictions.values()).reduce((sum, p) => sum + p.estimatedLifetimeValue, 0) / predictions.size
                      )
                    : '$0'
                  }
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 shadow-sm">
          <TabsTrigger value="insights" className="data-[state=active]:bg-lavender data-[state=active]:text-white">AI Insights</TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-lavender data-[state=active]:text-white">Smart Recommendations</TabsTrigger>
          <TabsTrigger value="predictions" className="data-[state=active]:bg-lavender data-[state=active]:text-white">Client Predictions</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-lavender data-[state=active]:text-white">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className={`border-2 ${getInsightColor(insight.type)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Confidence: {formatPercentage(insight.confidence)}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      // Navigate to enhanced clients page for action
                      window.location.href = '/enhanced-clients'
                    }}>
                      Take Action
                    </Button>
                  </div>
                  <div className="mt-3 p-3 bg-white/50 rounded-lg">
                    <p className="text-sm font-medium text-gray-800">Recommended Action:</p>
                    <p className="text-sm text-gray-600">{insight.action}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {/* High Priority Recommendations */}
            {highPriorityRecommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  High Priority Actions
                </h3>
                <div className="space-y-3">
                  {highPriorityRecommendations.map((rec) => (
                    <Card key={rec.id} className="border-2 border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getRecommendationIcon(rec.type)}
                            <div>
                              <h4 className="font-medium text-red-900">{rec.title}</h4>
                              <p className="text-sm text-red-700">{rec.description}</p>
                              <p className="text-xs text-red-600 mt-1">Expected: {rec.expectedOutcome}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              {rec.priority.toUpperCase()}
                            </Badge>
                            <Button size="sm" variant="outline" className="border-red-300 text-red-700" onClick={() => {
                              // Navigate to enhanced clients page for action
                              window.location.href = '/enhanced-clients'
                            }}>
                              Act Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Medium Priority Recommendations */}
            {mediumPriorityRecommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Medium Priority Actions
                </h3>
                <div className="space-y-3">
                  {mediumPriorityRecommendations.map((rec) => (
                    <Card key={rec.id} className="border-2 border-yellow-200 bg-yellow-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getRecommendationIcon(rec.type)}
                            <div>
                              <h4 className="font-medium text-yellow-900">{rec.title}</h4>
                              <p className="text-sm text-yellow-700">{rec.description}</p>
                              <p className="text-xs text-yellow-600 mt-1">Expected: {rec.expectedOutcome}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              {rec.priority.toUpperCase()}
                            </Badge>
                            <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700" onClick={() => {
                              // Navigate to enhanced clients page for action
                              window.location.href = '/enhanced-clients'
                            }}>
                              Schedule
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from(predictions.entries()).map(([clientId, prediction]) => {
              const client = getClientById(clientId)
              if (!client) return null

              return (
                <Card key={clientId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{client.firstName} {client.lastName}</CardTitle>
                        <CardDescription>{client.email}</CardDescription>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {client.pipeline.stage}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Retention Probability</p>
                        <p className="text-xl font-bold text-blue-600">{formatPercentage(prediction.retentionProbability)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Churn Risk</p>
                        <p className="text-xl font-bold text-red-600">{formatPercentage(prediction.churnRisk)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Next Purchase</p>
                        <p className="text-xl font-bold text-green-600">{formatPercentage(prediction.nextPurchaseProbability)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Lifetime Value</p>
                        <p className="text-xl font-bold text-purple-600">{formatCurrency(prediction.estimatedLifetimeValue)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Recommended Actions:</p>
                      <div className="space-y-1">
                        {prediction.recommendedActions.slice(0, 3).map((action, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['lead', 'consultation', 'booking', 'procedure', 'aftercare', 'touchup', 'retention'].map((stage, index) => {
                    const stageClients = clients.filter(c => c.pipeline.stage === stage)
                    const percentage = clients.length > 0 ? (stageClients.length / clients.length) * 100 : 0
                    
                    return (
                      <div key={stage} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-lavender"></div>
                          <span className="capitalize font-medium">{stage}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{stageClients.length} clients</div>
                          <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Risk Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-red-700">High Risk Clients</span>
                    <Badge className="bg-red-100 text-red-800">
                      {Array.from(predictions.values()).filter(p => p.churnRisk > 0.7).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-700">Medium Risk Clients</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {Array.from(predictions.values()).filter(p => p.churnRisk > 0.4 && p.churnRisk <= 0.7).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">Low Risk Clients</span>
                    <Badge className="bg-green-100 text-green-800">
                      {Array.from(predictions.values()).filter(p => p.churnRisk <= 0.4).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
