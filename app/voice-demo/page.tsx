"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VoiceToText } from '@/components/voice/voice-to-text'
import { NavBar } from '@/components/ui/navbar'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { Mic, MessageSquare, Mail, FileText } from 'lucide-react'

export default function VoiceToTextDemoPage() {
  const { currentUser } = useDemoAuth()

  const handleTranscriptionComplete = (text: string) => {
    console.log('Transcription completed:', text)
  }

  const handleRewriteComplete = (text: string) => {
    console.log('Rewrite completed:', text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-blue-50">
      <NavBar user={currentUser} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
                <Mic className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Voice-to-Text with AI Rewriting</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of PMU communication - dictate your messages and let AI make them professional and polished.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-purple-600 rounded-full">
                    <Mic className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-purple-800">Voice Input</CardTitle>
                <CardDescription className="text-purple-600">
                  Speak naturally and watch your words appear instantly
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-blue-600 rounded-full">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-blue-800">AI Rewriting</CardTitle>
                <CardDescription className="text-blue-600">
                  Transform casual speech into professional communication
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-green-600 rounded-full">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-green-800">Smart Context</CardTitle>
                <CardDescription className="text-green-600">
                  Adapts tone and style based on message type and recipient
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Demo Section */}
          <Card className="border-gray-200 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span>Try It Now</span>
              </CardTitle>
              <CardDescription>
                Click the microphone below to start dictating. The AI will help you create professional messages for your PMU clients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceToText
                onTranscriptionComplete={handleTranscriptionComplete}
                onRewriteComplete={handleRewriteComplete}
                placeholder="Click the microphone to start dictating your message..."
              />
            </CardContent>
          </Card>

          {/* Use Cases */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">Perfect For</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Client Follow-ups</h3>
                <p className="text-sm text-gray-600">
                  "Hey Sarah, how's your healing going?" → Professional follow-up message
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Appointment Reminders</h3>
                <p className="text-sm text-gray-600">
                  "Don't forget your touch-up tomorrow" → Polished reminder
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Aftercare Instructions</h3>
                <p className="text-sm text-gray-600">
                  "Keep it dry for 7 days" → Detailed care instructions
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Team Communication</h3>
                <p className="text-sm text-gray-600">
                  "Can you cover my shift?" → Professional internal message
                </p>
              </div>
            </div>
          </div>

          {/* Browser Support */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-600 rounded-full">
                  <Mic className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-800">Browser Support</h3>
                  <p className="text-sm text-orange-600">
                    Voice input works best in Chrome, Safari, and Edge. Make sure your microphone is enabled.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
