import { useState } from 'react'
import { ToolResult } from '@/components/client/save-to-client-prompt'
import { addClientAnalysis, getClientById } from '@/lib/client-storage'

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
      // Check if client exists
      const client = getClientById(clientId)
      if (!client) {
        throw new Error('Client not found')
      }

      // Convert ToolResult to ClientAnalysis format
      const analysisData = {
        type: result.type,
        result: (result.data?.riskLevel === 'High Risk' ? 'not_recommended' : 
                result.data?.riskLevel === 'Moderate Risk' ? 'precaution' : 'safe') as 'safe' | 'precaution' | 'not_recommended',
        notes: result.data?.summary || result.data?.notes || '',
        conditions: result.data?.medicalConditions || [],
        medications: result.data?.medications || [],
        rationale: result.data?.recommendations || '',
        fitzpatrick: result.data?.fitzpatrick || undefined,
        undertone: result.data?.undertone || undefined,
        confidence: result.data?.confidence || undefined,
        recommendedPigments: result.data?.recommendedPigments || [],
        imageUrl: result.data?.imageUrl || undefined
      }

      // Save to client profile
      const savedAnalysis = addClientAnalysis(clientId, analysisData)
      
      if (savedAnalysis) {
        console.log('Successfully saved to client file:', savedAnalysis)
        
        // Hide the prompt after successful save
        hideSavePrompt()
        
        // Show success message
        alert(`Results saved to ${client.name}'s profile successfully!`)
      } else {
        throw new Error('Failed to save analysis to client profile')
      }
      
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
