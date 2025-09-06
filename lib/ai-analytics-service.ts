// AI-powered analytics and prediction system
import { EnhancedClientProfile, PipelineStage } from '@/types/client-pipeline'

export interface AIInsight {
  id: string
  type: 'retention' | 'revenue' | 'conversion' | 'risk' | 'opportunity'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  action: string
  createdAt: Date
}

export interface PredictionModel {
  clientId: string
  retentionProbability: number
  nextPurchaseProbability: number
  estimatedLifetimeValue: number
  churnRisk: number
  recommendedActions: string[]
  lastUpdated: Date
}

export interface SmartRecommendation {
  id: string
  type: 'followup' | 'upsell' | 'retention' | 'timing' | 'procedure'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  clientId?: string
  suggestedDate?: Date
  expectedOutcome: string
}

// AI Analytics Service
export class AIAnalyticsService {
  private static instance: AIAnalyticsService
  private insights: AIInsight[] = []
  private predictions: Map<string, PredictionModel> = new Map()
  private recommendations: SmartRecommendation[] = []

  static getInstance(): AIAnalyticsService {
    if (!AIAnalyticsService.instance) {
      AIAnalyticsService.instance = new AIAnalyticsService()
    }
    return AIAnalyticsService.instance
  }

  // Generate AI insights from client data
  generateInsights(clients: EnhancedClientProfile[]): AIInsight[] {
    this.insights = []
    
    // Analyze pipeline conversion rates
    this.analyzePipelineConversion(clients)
    
    // Identify high-value opportunities
    this.identifyHighValueOpportunities(clients)
    
    // Detect churn risks
    this.detectChurnRisks(clients)
    
    // Revenue forecasting
    this.forecastRevenue(clients)
    
    // Retention optimization
    this.optimizeRetention(clients)

    return this.insights
  }

  private analyzePipelineConversion(clients: EnhancedClientProfile[]) {
    const stages: PipelineStage[] = ['lead', 'consultation', 'booking', 'procedure', 'aftercare', 'touchup', 'retention']
    const stageCounts = new Map<PipelineStage, number>()
    
    stages.forEach(stage => {
      stageCounts.set(stage, clients.filter(c => c.pipeline.stage === stage).length)
    })

    // Calculate conversion rates
    const leadToConsultation = stageCounts.get('consultation')! / Math.max(stageCounts.get('lead')!, 1)
    const consultationToBooking = stageCounts.get('booking')! / Math.max(stageCounts.get('consultation')!, 1)
    const bookingToProcedure = stageCounts.get('procedure')! / Math.max(stageCounts.get('booking')!, 1)

    if (leadToConsultation < 0.3) {
      this.insights.push({
        id: `insight_${Date.now()}_1`,
        type: 'conversion',
        title: 'Low Lead-to-Consultation Conversion',
        description: `Only ${(leadToConsultation * 100).toFixed(1)}% of leads convert to consultations. Consider improving lead qualification or follow-up process.`,
        confidence: 0.85,
        impact: 'high',
        action: 'Review lead qualification criteria and implement automated follow-up sequences',
        createdAt: new Date()
      })
    }

    if (consultationToBooking < 0.5) {
      this.insights.push({
        id: `insight_${Date.now()}_2`,
        type: 'conversion',
        title: 'Consultation-to-Booking Gap',
        description: `Only ${(consultationToBooking * 100).toFixed(1)}% of consultations result in bookings. Focus on consultation quality and pricing strategy.`,
        confidence: 0.78,
        impact: 'high',
        action: 'Enhance consultation process and review pricing strategy',
        createdAt: new Date()
      })
    }
  }

  private identifyHighValueOpportunities(clients: EnhancedClientProfile[]) {
    const highValueClients = clients.filter(c => c.pipeline.estimatedValue > 1000)
    const highProbabilityClients = clients.filter(c => c.pipeline.probability > 0.8)

    if (highValueClients.length > 0) {
      const avgValue = highValueClients.reduce((sum, c) => sum + c.pipeline.estimatedValue, 0) / highValueClients.length
      
      this.insights.push({
        id: `insight_${Date.now()}_3`,
        type: 'opportunity',
        title: 'High-Value Client Opportunities',
        description: `${highValueClients.length} clients with average value of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(avgValue)}. Focus on converting these prospects.`,
        confidence: 0.92,
        impact: 'high',
        action: 'Prioritize follow-up with high-value prospects and offer premium packages',
        createdAt: new Date()
      })
    }

    if (highProbabilityClients.length > 0) {
      this.insights.push({
        id: `insight_${Date.now()}_4`,
        type: 'opportunity',
        title: 'High-Probability Conversions',
        description: `${highProbabilityClients.length} clients with >80% conversion probability. These are low-hanging fruit for immediate attention.`,
        confidence: 0.88,
        impact: 'medium',
        action: 'Expedite follow-up with high-probability clients to secure bookings',
        createdAt: new Date()
      })
    }
  }

  private detectChurnRisks(clients: EnhancedClientProfile[]) {
    const aftercareClients = clients.filter(c => c.pipeline.stage === 'aftercare')
    const overdueFollowUps = clients.filter(c => {
      if (!c.pipeline.followUpDate) return false
      return new Date(c.pipeline.followUpDate) < new Date()
    })

    if (overdueFollowUps.length > 0) {
      this.insights.push({
        id: `insight_${Date.now()}_5`,
        type: 'risk',
        title: 'Overdue Follow-ups Detected',
        description: `${overdueFollowUps.length} clients have overdue follow-ups. This increases churn risk significantly.`,
        confidence: 0.95,
        impact: 'high',
        action: 'Immediately contact overdue clients to prevent churn',
        createdAt: new Date()
      })
    }

    const lowComplianceClients = aftercareClients.filter(c => c.aftercareStatus.complianceScore < 0.7)
    if (lowComplianceClients.length > 0) {
      this.insights.push({
        id: `insight_${Date.now()}_6`,
        type: 'risk',
        title: 'Low Aftercare Compliance',
        description: `${lowComplianceClients.length} clients show low aftercare compliance, increasing healing complications risk.`,
        confidence: 0.82,
        impact: 'medium',
        action: 'Implement enhanced aftercare monitoring and support for low-compliance clients',
        createdAt: new Date()
      })
    }
  }

  private forecastRevenue(clients: EnhancedClientProfile[]) {
    const totalPipelineValue = clients.reduce((sum, c) => sum + c.pipeline.estimatedValue, 0)
    const weightedRevenue = clients.reduce((sum, c) => sum + (c.pipeline.estimatedValue * c.pipeline.probability), 0)
    
    const conversionRate = clients.filter(c => c.pipeline.stage === 'retention').length / Math.max(clients.length, 1)
    const projectedRevenue = weightedRevenue * (1 + conversionRate)

    this.insights.push({
      id: `insight_${Date.now()}_7`,
      type: 'revenue',
      title: 'Revenue Forecast',
      description: `Pipeline value: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPipelineValue)}. Projected revenue: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(projectedRevenue)}`,
      confidence: 0.75,
      impact: 'medium',
      action: 'Focus on converting high-probability clients to maximize revenue',
      createdAt: new Date()
    })
  }

  private optimizeRetention(clients: EnhancedClientProfile[]) {
    const retentionClients = clients.filter(c => c.pipeline.stage === 'retention')
    const avgRetentionValue = retentionClients.length > 0 
      ? retentionClients.reduce((sum, c) => sum + c.pipeline.estimatedValue, 0) / retentionClients.length 
      : 0

    if (retentionClients.length > 0) {
      this.insights.push({
        id: `insight_${Date.now()}_8`,
        type: 'retention',
        title: 'Retention Optimization',
        description: `${retentionClients.length} retention clients with average value of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(avgRetentionValue)}. Focus on upselling and annual touch-ups.`,
        confidence: 0.88,
        impact: 'high',
        action: 'Implement loyalty program and annual touch-up reminders for retention clients',
        createdAt: new Date()
      })
    }
  }

  // Generate predictions for individual clients
  generatePredictions(clients: EnhancedClientProfile[]): Map<string, PredictionModel> {
    clients.forEach(client => {
      const prediction: PredictionModel = {
        clientId: client.id,
        retentionProbability: this.calculateRetentionProbability(client),
        nextPurchaseProbability: this.calculateNextPurchaseProbability(client),
        estimatedLifetimeValue: this.calculateLifetimeValue(client),
        churnRisk: this.calculateChurnRisk(client),
        recommendedActions: this.generateRecommendedActions(client),
        lastUpdated: new Date()
      }
      
      this.predictions.set(client.id, prediction)
    })

    return this.predictions
  }

  private calculateRetentionProbability(client: EnhancedClientProfile): number {
    let baseProbability = 0.5
    
    // Stage-based adjustments
    switch (client.pipeline.stage) {
      case 'retention':
        baseProbability = 0.9
        break
      case 'touchup':
        baseProbability = 0.8
        break
      case 'aftercare':
        baseProbability = 0.7
        break
      case 'procedure':
        baseProbability = 0.6
        break
      case 'booking':
        baseProbability = 0.4
        break
      case 'consultation':
        baseProbability = 0.3
        break
      case 'lead':
        baseProbability = 0.2
        break
    }

    // Value-based adjustments
    if (client.pipeline.estimatedValue > 1000) baseProbability += 0.1
    if (client.pipeline.estimatedValue > 1500) baseProbability += 0.1

    // Compliance adjustments
    baseProbability += client.aftercareStatus.complianceScore * 0.2

    return Math.min(baseProbability, 0.95)
  }

  private calculateNextPurchaseProbability(client: EnhancedClientProfile): number {
    let probability = 0.3

    // Higher probability for retention clients
    if (client.pipeline.stage === 'retention') probability = 0.8
    if (client.pipeline.stage === 'touchup') probability = 0.6
    if (client.pipeline.stage === 'aftercare') probability = 0.4

    // Value-based adjustments
    if (client.pipeline.estimatedValue > 1000) probability += 0.2

    return Math.min(probability, 0.9)
  }

  private calculateLifetimeValue(client: EnhancedClientProfile): number {
    let baseValue = client.pipeline.estimatedValue
    
    // Multiply by retention probability
    const retentionProb = this.calculateRetentionProbability(client)
    const lifetimeMultiplier = 1 + (retentionProb * 3) // 1-4x multiplier
    
    return baseValue * lifetimeMultiplier
  }

  private calculateChurnRisk(client: EnhancedClientProfile): number {
    let risk = 0.5

    // Stage-based risk
    if (client.pipeline.stage === 'lead') risk = 0.8
    if (client.pipeline.stage === 'consultation') risk = 0.6
    if (client.pipeline.stage === 'retention') risk = 0.2

    // Compliance risk
    risk += (1 - client.aftercareStatus.complianceScore) * 0.3

    // Overdue follow-up risk
    if (client.pipeline.followUpDate && new Date(client.pipeline.followUpDate) < new Date()) {
      risk += 0.3
    }

    return Math.min(risk, 0.95)
  }

  private generateRecommendedActions(client: EnhancedClientProfile): string[] {
    const actions: string[] = []

    // Stage-specific actions
    switch (client.pipeline.stage) {
      case 'lead':
        actions.push('Schedule consultation within 48 hours')
        actions.push('Send welcome package and pricing guide')
        break
      case 'consultation':
        actions.push('Follow up with consultation summary')
        actions.push('Send booking link and deposit request')
        break
      case 'booking':
        actions.push('Send pre-procedure instructions')
        actions.push('Confirm appointment 24 hours before')
        break
      case 'procedure':
        actions.push('Monitor healing progress')
        actions.push('Schedule follow-up appointment')
        break
      case 'aftercare':
        actions.push('Check healing progress')
        actions.push('Schedule touch-up if needed')
        break
      case 'touchup':
        actions.push('Complete touch-up procedure')
        actions.push('Schedule annual maintenance')
        break
      case 'retention':
        actions.push('Schedule annual touch-up')
        actions.push('Offer loyalty program benefits')
        break
    }

    // Risk-based actions
    if (this.calculateChurnRisk(client) > 0.7) {
      actions.push('Immediate follow-up required')
      actions.push('Consider special offer or discount')
    }

    return actions
  }

  // Generate smart recommendations
  generateRecommendations(clients: EnhancedClientProfile[]): SmartRecommendation[] {
    this.recommendations = []

    // Follow-up recommendations
    this.generateFollowUpRecommendations(clients)
    
    // Upsell recommendations
    this.generateUpsellRecommendations(clients)
    
    // Retention recommendations
    this.generateRetentionRecommendations(clients)
    
    // Timing recommendations
    this.generateTimingRecommendations(clients)

    return this.recommendations
  }

  private generateFollowUpRecommendations(clients: EnhancedClientProfile[]) {
    const overdueClients = clients.filter(c => 
      c.pipeline.followUpDate && new Date(c.pipeline.followUpDate) < new Date()
    )

    overdueClients.forEach(client => {
      this.recommendations.push({
        id: `rec_${Date.now()}_${client.id}_1`,
        type: 'followup',
        title: 'Urgent Follow-up Required',
        description: `${client.firstName} ${client.lastName} has overdue follow-up`,
        priority: 'high',
        clientId: client.id,
        suggestedDate: new Date(),
        expectedOutcome: 'Prevent churn and secure booking'
      })
    })
  }

  private generateUpsellRecommendations(clients: EnhancedClientProfile[]) {
    const highValueClients = clients.filter(c => c.pipeline.estimatedValue > 1000)

    highValueClients.forEach(client => {
      this.recommendations.push({
        id: `rec_${Date.now()}_${client.id}_2`,
        type: 'upsell',
        title: 'Upsell Opportunity',
        description: `${client.firstName} ${client.lastName} - High-value client ready for premium services`,
        priority: 'medium',
        clientId: client.id,
        suggestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        expectedOutcome: 'Increase average transaction value'
      })
    })
  }

  private generateRetentionRecommendations(clients: EnhancedClientProfile[]) {
    const retentionClients = clients.filter(c => c.pipeline.stage === 'retention')

    retentionClients.forEach(client => {
      this.recommendations.push({
        id: `rec_${Date.now()}_${client.id}_3`,
        type: 'retention',
        title: 'Annual Touch-up Due',
        description: `${client.firstName} ${client.lastName} - Schedule annual maintenance`,
        priority: 'medium',
        clientId: client.id,
        suggestedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        expectedOutcome: 'Maintain long-term client relationship'
      })
    })
  }

  private generateTimingRecommendations(clients: EnhancedClientProfile[]) {
    const consultationClients = clients.filter(c => c.pipeline.stage === 'consultation')

    consultationClients.forEach(client => {
      this.recommendations.push({
        id: `rec_${Date.now()}_${client.id}_4`,
        type: 'timing',
        title: 'Optimal Booking Window',
        description: `${client.firstName} ${client.lastName} - Best time to secure booking`,
        priority: 'high',
        clientId: client.id,
        suggestedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        expectedOutcome: 'Convert consultation to booking'
      })
    })
  }

  // Get insights by type
  getInsightsByType(type: AIInsight['type']): AIInsight[] {
    return this.insights.filter(insight => insight.type === type)
  }

  // Get high-priority recommendations
  getHighPriorityRecommendations(): SmartRecommendation[] {
    return this.recommendations.filter(rec => rec.priority === 'high')
  }

  // Get predictions for a specific client
  getClientPrediction(clientId: string): PredictionModel | null {
    return this.predictions.get(clientId) || null
  }
}


