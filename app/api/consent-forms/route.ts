import { NextRequest, NextResponse } from 'next/server'
import { ConsentForm } from '@/types/consent-forms'
import { consentFormsStorage, formAuditLog } from '@/lib/shared-storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const formType = searchParams.get('formType')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const artistId = searchParams.get('artistId') || 'default-artist'
    
    // Get all forms (in production, this would be a database query with filters)
    const allForms: ConsentForm[] = Array.from(consentFormsStorage.values())
    
    // Apply filters
    let filteredForms = allForms
    
    if (clientId) {
      filteredForms = filteredForms.filter(form => form.clientId === clientId)
    }
    
    if (formType) {
      filteredForms = filteredForms.filter(form => form.formType === formType)
    }
    
    if (status) {
      filteredForms = filteredForms.filter(form => form.status === status)
    }
    
    if (startDate) {
      const start = new Date(startDate)
      filteredForms = filteredForms.filter(form => new Date(form.createdAt) >= start)
    }
    
    if (endDate) {
      const end = new Date(endDate)
      filteredForms = filteredForms.filter(form => new Date(form.createdAt) <= end)
    }
    
    // Sort by creation date (newest first)
    filteredForms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // Add audit information
    const formsWithAudit = filteredForms.map(form => ({
      ...form,
      auditLog: formAuditLog.get(form.id) || [],
      lastAccessed: getLastAccessTime(form.id)
    }))
    
    return NextResponse.json({
      forms: formsWithAudit,
      total: formsWithAudit.length,
      filters: {
        clientId,
        formType,
        status,
        startDate,
        endDate,
        artistId
      }
    })
    
  } catch (error) {
    console.error('Error retrieving consent forms:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve forms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formId, action, notes } = body
    
    // Log the action
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      formId,
      notes,
      userType: 'artist',
      ipAddress: 'server-side' // In production, get from request
    }
    
    const existingLogs = formAuditLog.get(formId) || []
    existingLogs.push(logEntry)
    formAuditLog.set(formId, existingLogs)
    
    return NextResponse.json({
      success: true,
      message: 'Action logged successfully'
    })
    
  } catch (error) {
    console.error('Error logging action:', error)
    return NextResponse.json(
      { error: 'Failed to log action' },
      { status: 500 }
    )
  }
}

function getLastAccessTime(formId: string): string | null {
  const logs = formAuditLog.get(formId) || []
  if (logs.length === 0) return null
  
  // Get the most recent log entry
  const sortedLogs = logs.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  
  return sortedLogs[0].timestamp
}
