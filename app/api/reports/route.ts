import { NextRequest, NextResponse } from 'next/server'
import { ConsentForm } from '@/types/consent-forms'
import { consentFormsStorage, formAuditLog } from '@/lib/shared-storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'compliance'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const clientId = searchParams.get('clientId')
    const formType = searchParams.get('formType')
    
    // Get all forms
    const allForms: ConsentForm[] = Array.from(consentFormsStorage.values())
    
    // Apply date filters
    let filteredForms = allForms
    if (startDate) {
      const start = new Date(startDate)
      filteredForms = filteredForms.filter(form => new Date(form.createdAt) >= start)
    }
    if (endDate) {
      const end = new Date(endDate)
      filteredForms = filteredForms.filter(form => new Date(form.createdAt) <= end)
    }
    if (clientId) {
      filteredForms = filteredForms.filter(form => form.clientId === clientId)
    }
    if (formType) {
      filteredForms = filteredForms.filter(form => form.formType === formType)
    }
    
    let reportData: any = {}
    
    switch (reportType) {
      case 'compliance':
        reportData = generateComplianceReport(filteredForms)
        break
      case 'audit':
        reportData = generateAuditReport(filteredForms)
        break
      case 'summary':
        reportData = generateSummaryReport(filteredForms)
        break
      default:
        reportData = generateComplianceReport(filteredForms)
    }
    
    return NextResponse.json({
      reportType,
      generatedAt: new Date().toISOString(),
      filters: { startDate, endDate, clientId, formType },
      data: reportData
    })
    
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

function generateComplianceReport(forms: ConsentForm[]) {
  const completedForms = forms.filter(form => form.status === 'completed')
  const expiredForms = forms.filter(form => form.status === 'expired')
  const pendingForms = forms.filter(form => form.status === 'sent')
  
  const formTypeBreakdown = completedForms.reduce((acc, form) => {
    acc[form.formType] = (acc[form.formType] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const monthlyBreakdown = completedForms.reduce((acc, form) => {
    const month = new Date(form.completedAt!).toISOString().slice(0, 7) // YYYY-MM
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    summary: {
      totalForms: forms.length,
      completedForms: completedForms.length,
      expiredForms: expiredForms.length,
      pendingForms: pendingForms.length,
      completionRate: forms.length > 0 ? (completedForms.length / forms.length * 100).toFixed(1) : '0'
    },
    formTypeBreakdown,
    monthlyBreakdown,
    complianceStatus: {
      hasCompletedForms: completedForms.length > 0,
      hasExpiredForms: expiredForms.length > 0,
      hasPendingForms: pendingForms.length > 0,
      averageCompletionTime: calculateAverageCompletionTime(completedForms)
    }
  }
}

function generateAuditReport(forms: ConsentForm[]) {
  const auditTrail = forms.map(form => ({
    formId: form.id,
    clientName: form.clientName,
    formType: form.formType,
    status: form.status,
    createdAt: form.createdAt,
    completedAt: form.completedAt,
    auditLog: formAuditLog.get(form.id) || []
  }))
  
  const accessLog = auditTrail.flatMap(form => 
    form.auditLog.map(log => ({
      ...log,
      formId: form.formId,
      clientName: form.clientName,
      formType: form.formType
    }))
  )
  
  return {
    totalForms: forms.length,
    auditTrail,
    accessLog,
    summary: {
      totalAccesses: accessLog.length,
      uniqueFormsAccessed: new Set(accessLog.map(log => log.formId)).size,
      mostAccessedForm: getMostAccessedForm(accessLog),
      recentActivity: accessLog.slice(-10) // Last 10 activities
    }
  }
}

function generateSummaryReport(forms: ConsentForm[]) {
  const completedForms = forms.filter(form => form.status === 'completed')
  
  return {
    totalForms: forms.length,
    completedForms: completedForms.length,
    formTypes: Object.keys(completedForms.reduce((acc, form) => {
      acc[form.formType] = true
      return acc
    }, {} as Record<string, boolean>)),
    dateRange: {
      earliest: forms.length > 0 ? new Date(Math.min(...forms.map(f => new Date(f.createdAt).getTime()))).toISOString() : null,
      latest: forms.length > 0 ? new Date(Math.max(...forms.map(f => new Date(f.createdAt).getTime()))).toISOString() : null
    },
    clients: [...new Set(forms.map(form => form.clientId))].length
  }
}

function calculateAverageCompletionTime(forms: ConsentForm[]): string {
  if (forms.length === 0) return 'N/A'
  
  const completionTimes = forms
    .filter(form => form.completedAt)
    .map(form => {
      const created = new Date(form.createdAt).getTime()
      const completed = new Date(form.completedAt!).getTime()
      return completed - created
    })
  
  if (completionTimes.length === 0) return 'N/A'
  
  const averageMs = completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
  const averageHours = averageMs / (1000 * 60 * 60)
  
  return `${averageHours.toFixed(1)} hours`
}

function getMostAccessedForm(accessLog: any[]): any {
  if (accessLog.length === 0) return null
  
  const formAccessCounts = accessLog.reduce((acc, log) => {
    acc[log.formId] = (acc[log.formId] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const mostAccessedFormId = Object.entries(formAccessCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0][0]
  
  const formLogs = accessLog.filter(log => log.formId === mostAccessedFormId)
  
  return {
    formId: mostAccessedFormId,
    clientName: formLogs[0]?.clientName,
    formType: formLogs[0]?.formType,
    accessCount: formAccessCounts[mostAccessedFormId],
    lastAccessed: formLogs[formLogs.length - 1]?.timestamp
  }
}
