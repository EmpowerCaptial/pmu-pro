import { useState, useEffect, useCallback, useRef } from 'react'
import { useDemoAuth } from './use-demo-auth'

interface UseAutoSaveOptions {
  formType: 'client_intake' | 'consent_form' | 'credit_application' | 'artist_signup' | 'skin_analysis'
  clientId?: string
  debounceMs?: number
  onSave?: (data: any) => void
  onError?: (error: string) => void
}

export function useAutoSave<T extends Record<string, any>>(
  initialData: T,
  options: UseAutoSaveOptions
) {
  const { currentUser } = useDemoAuth()
  const [formData, setFormData] = useState<T>(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const debounceRef = useRef<NodeJS.Timeout>()
  const lastSavedDataRef = useRef<string>(JSON.stringify(initialData))

  const { formType, clientId, debounceMs = 1000, onSave, onError } = options

  // Load existing draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      if (!currentUser?.email) return

      try {
        const params = new URLSearchParams({
          formType,
          ...(clientId && { clientId })
        })

        const response = await fetch(`/api/form-drafts?${params}`, {
          headers: {
            'x-user-email': currentUser.email
          }
        })

        if (response.ok) {
          const { drafts } = await response.json()
          if (drafts.length > 0) {
            const latestDraft = drafts[0]
            setFormData(latestDraft.formData)
            setLastSaved(new Date(latestDraft.updatedAt))
            lastSavedDataRef.current = JSON.stringify(latestDraft.formData)
            setHasUnsavedChanges(false)
          }
        }
      } catch (error) {
        console.error('Error loading draft:', error)
        onError?.('Failed to load saved draft')
      }
    }

    loadDraft()
  }, [currentUser?.email, formType, clientId])

  // Auto-save function
  const saveDraft = useCallback(async (data: T) => {
    if (!currentUser?.email) return

    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch('/api/form-drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          formType,
          clientId,
          formData: data,
          isComplete: false
        })
      })

      if (response.ok) {
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
        lastSavedDataRef.current = JSON.stringify(data)
        onSave?.(data)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save draft')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save draft'
      setError(errorMessage)
      onError?.(errorMessage)
      console.error('Auto-save error:', error)
    } finally {
      setIsSaving(false)
    }
  }, [currentUser?.email, formType, clientId, onSave, onError])

  // Debounced auto-save
  const debouncedSave = useCallback((data: T) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      const currentDataString = JSON.stringify(data)
      if (currentDataString !== lastSavedDataRef.current) {
        saveDraft(data)
      }
    }, debounceMs)
  }, [saveDraft, debounceMs])

  // Update form data and trigger auto-save
  const updateFormData = useCallback((updates: Partial<T> | ((prev: T) => T)) => {
    setFormData(prev => {
      const newData = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates }
      
      // Special handling for signature fields - don't mark as unsaved changes for signature updates
      const isSignatureUpdate = typeof updates === 'object' && updates && 
        Object.keys(updates).some(key => key.toLowerCase().includes('signature'))
      
      if (!isSignatureUpdate) {
        setHasUnsavedChanges(JSON.stringify(newData) !== lastSavedDataRef.current)
        debouncedSave(newData)
      }
      
      return newData
    })
  }, [debouncedSave])

  // Manual save function
  const saveForm = useCallback(async (data: T, isComplete = false) => {
    if (!currentUser?.email) return

    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch('/api/form-drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          formType,
          clientId,
          formData: data,
          isComplete
        })
      })

      if (response.ok) {
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
        lastSavedDataRef.current = JSON.stringify(data)
        onSave?.(data)
        return true
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save form')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save form'
      setError(errorMessage)
      onError?.(errorMessage)
      console.error('Save error:', error)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [currentUser?.email, formType, clientId, onSave, onError])

  // Clear draft function
  const clearDraft = useCallback(async () => {
    if (!currentUser?.email) return

    try {
      const params = new URLSearchParams({
        formType,
        ...(clientId && { clientId })
      })

      await fetch(`/api/form-drafts?${params}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': currentUser.email
        }
      })

      setFormData(initialData)
      setLastSaved(null)
      setHasUnsavedChanges(false)
      setError(null)
      lastSavedDataRef.current = JSON.stringify(initialData)
    } catch (error) {
      console.error('Error clearing draft:', error)
    }
  }, [currentUser?.email, formType, clientId, initialData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return {
    formData,
    updateFormData,
    saveForm,
    clearDraft,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    error
  }
}
