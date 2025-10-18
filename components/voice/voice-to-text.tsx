"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Wand2, 
  Copy, 
  Trash2,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface VoiceToTextProps {
  onTranscriptionComplete: (text: string) => void
  onRewriteComplete?: (rewrittenText: string) => void
  placeholder?: string
  className?: string
}

interface RewriteOptions {
  tone: 'professional' | 'friendly' | 'urgent' | 'casual'
  length: 'concise' | 'detailed' | 'standard'
  context: 'follow-up' | 'reminder' | 'instructions' | 'marketing' | 'general'
}

export function VoiceToText({ 
  onTranscriptionComplete, 
  onRewriteComplete,
  placeholder = "Click the microphone to start recording...",
  className = ""
}: VoiceToTextProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcribedText, setTranscribedText] = useState('')
  const [rewrittenText, setRewrittenText] = useState('')
  const [isRewriting, setIsRewriting] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [rewriteOptions, setRewriteOptions] = useState<RewriteOptions>({
    tone: 'professional',
    length: 'standard',
    context: 'general'
  })

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-US'
        
        recognition.onstart = () => {
          setIsRecording(true)
          toast.success("Recording started...")
        }
        
        recognition.onresult = (event) => {
          let finalTranscript = ''
          let interimTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }
          
          setTranscribedText(finalTranscript + interimTranscript)
        }
        
        recognition.onend = () => {
          setIsRecording(false)
          if (transcribedText.trim()) {
            onTranscriptionComplete(transcribedText.trim())
            toast.success("Recording completed!")
          }
        }
        
        recognition.onerror = (event) => {
          setIsRecording(false)
          toast.error(`Recording error: ${event.error}`)
        }
        
        setRecognition(recognition)
      } else {
        setIsSupported(false)
        toast.error("Speech recognition not supported in this browser")
      }
    }
  }, [])

  const startRecording = () => {
    if (recognition && !isRecording) {
      setTranscribedText('')
      setRewrittenText('')
      recognition.start()
    }
  }

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop()
    }
  }

  const rewriteWithAI = async () => {
    if (!transcribedText.trim()) {
      toast.error("No text to rewrite")
      return
    }

    setIsRewriting(true)
    try {
      const response = await fetch('/api/ai/rewrite-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: transcribedText,
          options: rewriteOptions
        })
      })

      if (!response.ok) {
        throw new Error('Failed to rewrite text')
      }

      const data = await response.json()
      setRewrittenText(data.rewrittenText)
      
      if (onRewriteComplete) {
        onRewriteComplete(data.rewrittenText)
      }
      
      toast.success("Text rewritten successfully!")
    } catch (error) {
      console.error('Error rewriting text:', error)
      toast.error("Failed to rewrite text. Please try again.")
    } finally {
      setIsRewriting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const clearText = () => {
    setTranscribedText('')
    setRewrittenText('')
  }

  if (!isSupported) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardContent className="p-4">
          <p className="text-red-600 text-sm">
            Speech recognition is not supported in this browser. 
            Please use Chrome, Safari, or Edge for voice input.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Recording Controls */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                size="sm"
                className="flex items-center space-x-2"
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    <span>Start Recording</span>
                  </>
                )}
              </Button>
              
              {isRecording && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-600">Recording...</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {rewriteOptions.tone}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {rewriteOptions.length}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {rewriteOptions.context}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-2">
            {placeholder}
          </p>
        </CardContent>
      </Card>

      {/* Transcribed Text */}
      {transcribedText && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-green-800">Transcribed Text</h3>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => copyToClipboard(transcribedText)}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  onClick={rewriteWithAI}
                  variant="outline"
                  size="sm"
                  disabled={isRewriting}
                >
                  {isRewriting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  Rewrite with AI
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {transcribedText}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rewritten Text */}
      {rewrittenText && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-purple-800">AI Rewritten Text</h3>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => copyToClipboard(rewrittenText)}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  onClick={clearText}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {rewrittenText}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rewrite Options */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Rewrite Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tone */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tone</label>
              <select
                value={rewriteOptions.tone}
                onChange={(e) => setRewriteOptions(prev => ({ 
                  ...prev, 
                  tone: e.target.value as RewriteOptions['tone'] 
                }))}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="urgent">Urgent</option>
                <option value="casual">Casual</option>
              </select>
            </div>

            {/* Length */}
            <div>
              <label className="text-sm font-medium mb-2 block">Length</label>
              <select
                value={rewriteOptions.length}
                onChange={(e) => setRewriteOptions(prev => ({ 
                  ...prev, 
                  length: e.target.value as RewriteOptions['length'] 
                }))}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="concise">Concise</option>
                <option value="standard">Standard</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>

            {/* Context */}
            <div>
              <label className="text-sm font-medium mb-2 block">Context</label>
              <select
                value={rewriteOptions.context}
                onChange={(e) => setRewriteOptions(prev => ({ 
                  ...prev, 
                  context: e.target.value as RewriteOptions['context'] 
                }))}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="general">General</option>
                <option value="follow-up">Follow-up</option>
                <option value="reminder">Reminder</option>
                <option value="instructions">Instructions</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
