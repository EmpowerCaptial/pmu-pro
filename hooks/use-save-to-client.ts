import { useState } from 'react'
import { ToolResult } from '@/components/client/save-to-client-prompt'

interface UseSaveToClientReturn {
  showSavePrompt: boolean
  currentToolResult: ToolResult | null
  promptToSave: (toolResult: ToolResult) => void
  hideSavePrompt: () => void
  handleSave: (clientId: string, result: ToolResult) => Promise<void>
  handleSkip: () => void
  isSaving: boolean
  saveError: string | null
}

export function useSaveToClient(): UseSaveToClientReturn {
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const [currentToolResult, setCurrentToolResult] = useState<ToolResult | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const promptToSave = (toolResult: ToolResult) => {
    setCurrentToolResult(toolResult)
    setShowSavePrompt(true)
    setSaveError(null)
  }

  const hideSavePrompt = () => {
    setShowSavePrompt(false)
    setCurrentToolResult(null)
    setSaveError(null)
  }

  const handleSave = async (clientId: string, result: ToolResult) => {
    setIsSaving(true)
    setSaveError(null)

    try {
      const response = await fetch('/api/client-tools/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          toolResult: result
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save to client file')
      }

      const saveResult = await response.json()
      console.log('Successfully saved to client file:', saveResult)
      
      // Hide the prompt after successful save
      hideSavePrompt()
      
      // You can add a success notification here
      // toast.success(`Results saved to client file successfully!`)
      
    } catch (error) {
      console.error('Error saving to client file:', error)
      setSaveError(error instanceof Error ? error.message : 'Failed to save to client file')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSkip = () => {
    hideSavePrompt()
    // You can add a notification here if needed
    // toast.info('Results not saved - using tool only')
  }

  return {
    showSavePrompt,
    currentToolResult,
    promptToSave,
    hideSavePrompt,
    handleSave,
    handleSkip,
    isSaving,
    saveError
  }
}
