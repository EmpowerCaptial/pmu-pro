"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Save, AlertTriangle, X } from 'lucide-react'

interface FormRecoveryProps {
  hasUnsavedChanges: boolean
  isSaving: boolean
  lastSaved: Date | null
  onSave: () => void
  onDiscard: () => void
  formName?: string
  isSubmitting?: boolean
}

export function FormRecovery({
  hasUnsavedChanges,
  isSaving,
  lastSaved,
  onSave,
  onDiscard,
  formName = 'form',
  isSubmitting = false
}: FormRecoveryProps) {
  const router = useRouter()

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Don't show warning if form is being submitted
      if (hasUnsavedChanges && !isSubmitting) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    const handleRouteChange = () => {
      // Don't show warning if form is being submitted
      if (hasUnsavedChanges && !isSubmitting) {
        const confirmed = window.confirm(
          'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
        )
        if (!confirmed) {
          router.back()
          return false
        }
      }
      return true
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // Note: Next.js doesn't have a built-in way to intercept route changes
    // This would need to be implemented at the page level or using a custom hook

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges, isSubmitting, router])

  // Don't show recovery component if form is being submitted
  if (isSubmitting || (!hasUnsavedChanges && !isSaving)) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert className={`border-l-4 ${
        hasUnsavedChanges 
          ? 'border-orange-500 bg-orange-50' 
          : 'border-blue-500 bg-blue-50'
      }`}>
        <div className="flex items-start gap-2">
          {hasUnsavedChanges ? (
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
          ) : (
            <Save className="h-4 w-4 text-blue-600 mt-0.5" />
          )}
          <div className="flex-1">
            <AlertDescription className="text-sm">
              {isSaving ? (
                <span className="text-blue-600">Saving {formName}...</span>
              ) : hasUnsavedChanges ? (
                <span className="text-orange-600">
                  You have unsaved changes in your {formName}
                </span>
              ) : lastSaved ? (
                <span className="text-green-600">
                  {formName} saved at {lastSaved.toLocaleTimeString()}
                </span>
              ) : null}
            </AlertDescription>
            {hasUnsavedChanges && (
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving}
                  className="h-7 px-2 text-xs"
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDiscard}
                  disabled={isSaving}
                  className="h-7 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Discard
                </Button>
              </div>
            )}
          </div>
        </div>
      </Alert>
    </div>
  )
}
