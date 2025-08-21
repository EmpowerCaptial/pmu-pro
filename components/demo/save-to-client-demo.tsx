"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSaveToClient } from "@/hooks/use-save-to-client"
import { SaveToClientPrompt, ToolResult } from "@/components/client/save-to-client-prompt"
import { FileText, User, Palette, Activity } from "lucide-react"

export function SaveToClientDemo() {
  const [selectedTool, setSelectedTool] = useState<string>("")
  
  const {
    showSavePrompt,
    currentToolResult,
    promptToSave,
    hideSavePrompt,
    handleSave,
    handleSkip,
    isSaving,
    saveError
  } = useSaveToClient()

  const simulateToolCompletion = (toolType: string) => {
    setSelectedTool(toolType)
    
    let toolResult: ToolResult
    
    switch (toolType) {
      case 'intake':
        toolResult = {
          type: 'intake',
          data: {
            conditions: ['Hypertension', 'Diabetes'],
            medications: ['Metformin', 'Lisinopril'],
            notes: 'Client has well-controlled conditions',
            result: 'safe',
            rationale: 'Conditions are well-managed with medication',
            flaggedItems: 'Monitor blood pressure during procedure'
          },
          timestamp: new Date().toISOString(),
          toolName: 'Intake Form'
        }
        break
        
      case 'consent':
        toolResult = {
          type: 'consent',
          data: {
            fileUrl: '/consent-forms/sample.pdf',
            filename: 'PMU_Consent_Form_2024.pdf',
            fileSize: 245760,
            mimeType: 'application/pdf',
            notes: 'Consent form completed and signed'
          },
          timestamp: new Date().toISOString(),
          toolName: 'Consent Form'
        }
        break
        
      case 'skin-analysis':
        toolResult = {
          type: 'skin-analysis',
          data: {
            fitzpatrick: 3,
            undertone: 'warm',
            confidence: 0.89,
            photoId: 'photo_123',
            recommendation: {
              pigmentRecommendations: ['Permablend Warm Brown', 'Li Pigments Golden Brown'],
              healingPrediction: 'Excellent healing potential',
              maintenanceSchedule: ['2 weeks', '6 weeks', '3 months']
            },
            notes: 'Ideal skin type for PMU procedures'
          },
          timestamp: new Date().toISOString(),
          toolName: 'Skin Analysis'
        }
        break
        
      case 'color-correction':
        toolResult = {
          type: 'color-correction',
          data: {
            originalColor: 'rgb(120, 80, 60)',
            correctedColor: '#8B4513',
            recommendations: {
              'Permablend': ['Warm Brown Corrector'],
              'Li Pigments': ['Golden Brown Neutralizer']
            },
            analysisType: 'color-correction'
          },
          timestamp: new Date().toISOString(),
          toolName: 'Color Correction Analysis'
        }
        break
        
      default:
        return
    }
    
    promptToSave(toolResult)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Save to Client File Demo
        </h1>
        <p className="text-gray-600">
          This demonstrates how artists are prompted to save tool results to client files after completing each tool.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => simulateToolCompletion('intake')}>
          <CardHeader className="text-center">
            <FileText className="h-12 w-12 mx-auto text-blue-600 mb-2" />
            <CardTitle className="text-lg">Intake Form</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Complete client intake and medical history
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => simulateToolCompletion('consent')}>
          <CardHeader className="text-center">
            <FileText className="h-12 w-12 mx-auto text-green-600 mb-2" />
            <CardTitle className="text-lg">Consent Form</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Digital consent and waiver completion
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => simulateToolCompletion('skin-analysis')}>
          <CardHeader className="text-center">
            <User className="h-12 w-12 mx-auto text-purple-600 mb-2" />
            <CardTitle className="text-lg">Skin Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Fitzpatrick type and pigment matching
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => simulateToolCompletion('color-correction')}>
          <CardHeader className="text-center">
            <Palette className="h-12 w-12 mx-auto text-orange-600 mb-2" />
            <CardTitle className="text-lg">Color Correction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Pigment color correction analysis
            </p>
          </CardContent>
        </Card>
      </div>

      {selectedTool && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Tool Completed: {selectedTool}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              The tool has completed its analysis. You should now see a prompt asking if you want to save the results to a client file.
            </p>
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedTool("")}
                className="text-blue-600 border-blue-300"
              >
                Reset Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {saveError && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">Save Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{saveError}</p>
          </CardContent>
        </Card>
      )}

      {/* Save to Client File Prompt */}
      {showSavePrompt && currentToolResult && (
        <SaveToClientPrompt
          toolResult={currentToolResult}
          onSave={handleSave}
          onSkip={handleSkip}
          isOpen={showSavePrompt}
          onOpenChange={hideSavePrompt}
        />
      )}

      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-600" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-700">
            <p><strong>1. Complete a Tool:</strong> Use any of the tools above to simulate completion</p>
            <p><strong>2. Save Prompt Appears:</strong> You'll be asked if you want to save results to a client file</p>
            <p><strong>3. Choose Option:</strong> Save to existing client, create new client, or skip</p>
            <p><strong>4. Results Saved:</strong> All tool data is automatically organized in the client's file</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
