"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { UnifiedSkinAnalysis } from "@/components/analyze/unified-skin-analysis"
import { Button } from "@/components/ui/button"
import { Home, Save, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getClientById } from "@/lib/client-storage"
import { addClientAnalysis } from "@/lib/client-storage"
import { useRouter } from "next/navigation"
import { useDemoAuth } from "@/hooks/use-demo-auth"

const fitzpatrickTypes = [
  { id: 1, name: "Type I", description: "Always burns, never tans", color: "#FFE5D1" },
  { id: 2, name: "Type II", description: "Usually burns, tans minimally", color: "#F4D4C3" },
  { id: 3, name: "Type III", description: "Sometimes burns, tans gradually", color: "#E6C3A8" },
  { id: 4, name: "Type IV", description: "Burns minimally, tans well", color: "#D4A574" },
  { id: 5, name: "Type V", description: "Rarely burns, tans deeply", color: "#B87C56" },
  { id: 6, name: "Type VI", description: "Never burns, deeply pigmented", color: "#5D3A1F" }
]

interface ClientAnalyzePageProps {
  clientId?: string
}

export default function ClientAnalyzePage({ clientId }: ClientAnalyzePageProps) {
  const router = useRouter()
  const { currentUser } = useDemoAuth()
  const [client, setClient] = useState<any>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState('')
  
  // Fallback user if not authenticated
  const user = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase()
  } : {
    name: "PMU Artist",
    email: "artist@pmupro.com",
    initials: "PA",
  }

  useEffect(() => {
    if (clientId) {
      const clientData = getClientById(clientId)
      if (clientData) {
        setClient(clientData)
      } else {
        console.error('Client not found:', clientId)
        setSaveMessage('Client not found. Please return to dashboard and try again.')
      }
    }
  }, [clientId])

  const handleAnalysisComplete = (result: any) => {
    console.log("Unified analysis completed:", result)
  }

  const handleSave = async (result: any) => {
    if (!clientId || !client) {
      setSaveStatus('error')
      setSaveMessage('No client selected. Please return to dashboard and select a client.')
      return
    }

    setSaveStatus('saving')
    setSaveMessage('Saving analysis to client profile...')

    try {
      // Convert the unified analysis result to the format expected by addClientAnalysis
      const fitzpatrickType = fitzpatrickTypes.find(t => t.id === result.fitzpatrick)
      
      const analysisData = {
        type: 'skin-analysis' as const,
        result: 'safe' as const, // Default to safe for skin analysis
        notes: `Fitzpatrick Type ${result.fitzpatrick} (${fitzpatrickType?.description || 'Unknown'}) - ${result.undertone} undertone`,
        conditions: [],
        medications: [],
        rationale: `Comprehensive skin analysis completed. Fitzpatrick: Type ${result.fitzpatrick}, Undertone: ${result.undertone}, Confidence: ${result.confidence}%`,
        fitzpatrick: result.fitzpatrick,
        undertone: result.undertone,
        confidence: result.confidence || 85,
        recommendedPigments: result.pigmentRecommendations.brows.map((p: any) => p.name),
        imageUrl: undefined
      }

      // Save to client profile
      const savedAnalysis = addClientAnalysis(clientId, analysisData)
      
      if (savedAnalysis) {
        setSaveStatus('success')
        setSaveMessage(`✅ Analysis saved to ${client.name}'s profile successfully!`)
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSaveStatus('idle')
          setSaveMessage('')
        }, 5000)
        
        console.log('Successfully saved analysis to client profile:', savedAnalysis)
      } else {
        throw new Error('Failed to save analysis to client profile')
      }
    } catch (error) {
      console.error('Error saving analysis:', error)
      setSaveStatus('error')
      setSaveMessage(`❌ Failed to save analysis: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleExport = (result: any) => {
    console.log("Exporting unified analysis result:", result)
  }

  const handleBackToClient = () => {
    if (clientId) {
      router.push(`/clients/${clientId}`)
    } else {
      router.push('/clients')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/images/pmu-guide-logo.png"
          alt="PMU Guide Logo"
          className="w-[40%] max-w-lg h-auto opacity-10 object-contain"
        />
      </div>

      <NavBar currentPath="/analyze" user={user} />
      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Client Info Banner */}
        {client && (
          <div className="mb-6 p-4 bg-gradient-to-r from-lavender/20 to-blue-50 border border-lavender/30 rounded-lg">
            {/* Mobile Layout */}
            <div className="md:hidden text-center mb-4">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 bg-lavender rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-lavender-800">Analyzing for: {client.name}</h3>
                  <p className="text-sm text-lavender-600">{client.email}</p>
                </div>
              </div>
              <Button
                onClick={handleBackToClient}
                variant="outline"
                size="sm"
                className="border-lavender/30 text-lavender-700 hover:bg-lavender/10 w-full"
              >
                ← Back to Client
              </Button>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-lavender rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-lavender-800">Analyzing for: {client.name}</h3>
                  <p className="text-sm text-lavender-600">{client.email}</p>
                </div>
              </div>
              <Button
                onClick={handleBackToClient}
                variant="outline"
                size="sm"
                className="border-lavender/30 text-lavender-700 hover:bg-lavender/10"
              >
                ← Back to Client
              </Button>
            </div>
          </div>
        )}

        {/* Save Status Messages */}
        {saveStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-lg border ${
            saveStatus === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : saveStatus === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center gap-3">
              {saveStatus === 'saving' && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
              {saveStatus === 'success' && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              {saveStatus === 'error' && (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">{saveMessage}</span>
            </div>
          </div>
        )}

        {/* Mobile Header */}
        <div className="md:hidden mb-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-8 h-8 object-contain" />
              <h1 className="text-2xl font-bold text-foreground font-serif">Unified Skin Analysis</h1>
            </div>
            <p className="text-sm text-muted-foreground px-4">
              {client 
                ? `One photo, comprehensive analysis for ${client.name}` 
                : 'One photo, comprehensive analysis: Fitzpatrick type, undertone detection, and pigment recommendations'
              }
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {client && (
              <Button
                onClick={handleBackToClient}
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-lavender/10 hover:border-lavender bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold"
              >
                <Home className="h-4 w-4" />
                Back to Client
              </Button>
            )}
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-lavender/10 hover:border-lavender bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 text-center">
            <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif mb-2">Unified Skin Analysis</h1>
              <p className="text-muted-foreground">
                {client 
                  ? `One photo, comprehensive analysis for ${client.name}` 
                  : 'One photo, comprehensive analysis: Fitzpatrick type, undertone detection, and pigment recommendations'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {client && (
              <Button
                onClick={handleBackToClient}
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-lavender/10 hover:border-lavender bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold"
              >
                <Home className="h-4 w-4" />
                Back to Client
              </Button>
            )}
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-lavender/10 hover:border-lavender bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <UnifiedSkinAnalysis 
          onAnalysisComplete={handleAnalysisComplete}
          onSave={handleSave}
          onExport={handleExport}
        />
      </main>
    </div>
  )
}
