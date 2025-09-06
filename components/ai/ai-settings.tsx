"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Bot, MessageSquare, Calendar, Clock, Settings, Zap, Shield, Users, Syringe } from "lucide-react"
import { useDemoAuth } from "@/hooks/use-demo-auth"

interface AISettings {
  isEnabled: boolean
  mode: 'ai-assistant' | 'manual-response' | 'hybrid'
  businessHours: {
    start: string
    end: string
    timezone: string
  }
  services: string[]
  customGreeting: string
  autoBooking: boolean
  requireConfirmation: boolean
  metaIntegration: {
    isConnected: boolean
    pageId: string
    accessToken: string
  }
  bookingIntegration: {
    isEnabled: boolean
    platform: 'calendly' | 'acuity' | 'square' | 'booksy' | 'none'
    apiKey: string
    userId?: string
    locationId?: string
    businessId?: string
  }
}

export function AISettings() {
  const { currentUser } = useDemoAuth()
  const [settings, setSettings] = useState<AISettings>({
    isEnabled: false,
    mode: 'ai-assistant',
    businessHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'America/New_York'
    },
    services: ['Microblading', 'Lip Blush', 'Eyebrow Enhancement'],
    customGreeting: "Hi! I'm your AI assistant. I can help you book appointments, answer questions about our services, and provide information about our PMU procedures. How can I help you today?",
    autoBooking: true,
    requireConfirmation: true,
    metaIntegration: {
      isConnected: false,
      pageId: '',
      accessToken: ''
    },
    bookingIntegration: {
      isEnabled: false,
      platform: 'none',
      apiKey: '',
      userId: '',
      locationId: '',
      businessId: ''
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleSave = async () => {
    setIsLoading(true)
    setSaveStatus('saving')
    
    try {
      // Save AI settings to localStorage for now
      localStorage.setItem('pmu_ai_settings', JSON.stringify(settings))
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving AI settings:', error)
      setSaveStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const connectMetaBusiness = async () => {
    // Redirect to the seamless Meta integration page
    window.location.href = '/integrations/meta';
  }

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case 'ai-assistant':
        return 'AI handles all customer inquiries and books appointments automatically'
      case 'manual-response':
        return 'AI notifies you of messages, but you respond manually'
      case 'hybrid':
        return 'AI handles basic inquiries, you handle complex requests'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure your AI assistant to handle customer inquiries and bookings automatically
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${settings.isEnabled ? 'bg-green-500 shadow-green-200 shadow-lg animate-pulse' : 'bg-red-500'}`}></div>
            <Badge variant={settings.isEnabled ? "default" : "secondary"} className={settings.isEnabled ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
              {settings.isEnabled ? '🤖 AI ACTIVE' : '⚫ AI INACTIVE'}
            </Badge>
          </div>
          <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus === 'saved' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">✅ AI settings saved successfully!</p>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">❌ Error saving settings. Please try again.</p>
        </div>
      )}

      {/* Main Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Response Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Response Mode</Label>
              <Select value={settings.mode} onValueChange={(value: any) => setSettings({...settings, mode: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                                        <SelectItem value="ai-assistant" className="bg-white hover:bg-blue-50 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          AI Assistant (Fully Automated)
                        </div>
                      </SelectItem>
                      <SelectItem value="manual-response" className="bg-white hover:bg-blue-50 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Manual Response (AI Notifications)
                        </div>
                      </SelectItem>
                      <SelectItem value="hybrid" className="bg-white hover:bg-blue-50 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Hybrid (AI + Manual)
                        </div>
                      </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600">{getModeDescription(settings.mode)}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Enable AI Assistant</Label>
                <div className={`w-3 h-3 rounded-full ${settings.isEnabled ? 'bg-green-500 shadow-green-200 shadow-lg animate-pulse' : 'bg-gray-400'}`}></div>
                <span className={`text-xs font-medium ${settings.isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {settings.isEnabled ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <Switch
                checked={settings.isEnabled}
                onCheckedChange={(checked) => setSettings({...settings, isEnabled: checked})}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Start Time</Label>
                <Input
                  type="time"
                  value={settings.businessHours.start}
                  onChange={(e) => setSettings({
                    ...settings,
                    businessHours: {...settings.businessHours, start: e.target.value}
                  })}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">End Time</Label>
                <Input
                  type="time"
                  value={settings.businessHours.end}
                  onChange={(e) => setSettings({
                    ...settings,
                    businessHours: {...settings.businessHours, end: e.target.value}
                  })}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Timezone</Label>
              <Select 
                value={settings.businessHours.timezone} 
                onValueChange={(value) => setSettings({
                  ...settings,
                  businessHours: {...settings.businessHours, timezone: value}
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                                                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="America/New_York" className="bg-white hover:bg-blue-50 border-b border-gray-100">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago" className="bg-white hover:bg-blue-50 border-b border-gray-100">Central Time</SelectItem>
                  <SelectItem value="America/Denver" className="bg-white hover:bg-blue-50 border-b border-gray-100">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles" className="bg-white hover:bg-blue-50 border-b border-gray-100">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5" />
              Available Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Services AI Can Book</Label>
              <div className="space-y-2">
                {settings.services.map((service, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={service}
                      onChange={(e) => {
                        const newServices = [...settings.services]
                        newServices[index] = e.target.value
                        setSettings({...settings, services: newServices})
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newServices = settings.services.filter((_, i) => i !== index)
                        setSettings({...settings, services: newServices})
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSettings({
                    ...settings,
                    services: [...settings.services, 'New Service']
                  })}
                >
                  Add Service
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meta Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Meta Business Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Facebook Page Connected</Label>
                <Badge variant={settings.metaIntegration.isConnected ? "default" : "secondary"}>
                  {settings.metaIntegration.isConnected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
              
              {!settings.metaIntegration.isConnected ? (
                <div className="space-y-3">
                  <Button onClick={connectMetaBusiness} className="w-full bg-blue-600 hover:bg-blue-700">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Connect Facebook Page
                  </Button>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Seamless Connection:</strong> One-click Facebook OAuth integration. 
                      No technical knowledge required!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Page ID</Label>
                    <Input
                      value={settings.metaIntegration.pageId}
                      onChange={(e) => setSettings({
                        ...settings,
                        metaIntegration: {...settings.metaIntegration, pageId: e.target.value}
                      })}
                      placeholder="Enter your Facebook Page ID"
                    />
                  </div>
                  <Button variant="outline" className="w-full">
                    Disconnect Page
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Booking Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Platform Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Enable Booking Integration</Label>
                  <div className={`w-2 h-2 rounded-full ${settings.bookingIntegration.isEnabled ? 'bg-orange-500 shadow-orange-200 shadow-md' : 'bg-gray-400'}`}></div>
                  <span className={`text-xs font-medium ${settings.bookingIntegration.isEnabled ? 'text-orange-600' : 'text-gray-500'}`}>
                    {settings.bookingIntegration.isEnabled ? 'CONNECTED' : 'DISABLED'}
                  </span>
                </div>
                <Switch
                  checked={settings.bookingIntegration.isEnabled}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    bookingIntegration: {...settings.bookingIntegration, isEnabled: checked}
                  })}
                  className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-gray-300"
                />
              </div>
              
              {settings.bookingIntegration.isEnabled && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Booking Platform</Label>
                    <Select 
                      value={settings.bookingIntegration.platform} 
                      onValueChange={(value: any) => setSettings({
                        ...settings,
                        bookingIntegration: {...settings.bookingIntegration, platform: value}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                                              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="calendly" className="bg-white hover:bg-blue-50 border-b border-gray-100">Calendly</SelectItem>
                          <SelectItem value="acuity" className="bg-white hover:bg-blue-50 border-b border-gray-100">Acuity Scheduling</SelectItem>
                          <SelectItem value="square" className="bg-white hover:bg-blue-50 border-b border-gray-100">Square Appointments</SelectItem>
                          <SelectItem value="booksy" className="bg-white hover:bg-blue-50 border-b border-gray-100">Booksy</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">API Key</Label>
                    <Input
                      type="password"
                      value={settings.bookingIntegration.apiKey}
                      onChange={(e) => setSettings({
                        ...settings,
                        bookingIntegration: {...settings.bookingIntegration, apiKey: e.target.value}
                      })}
                      placeholder="Enter your API key"
                    />
                  </div>
                  
                  {settings.bookingIntegration.platform === 'calendly' && (
                    <div>
                      <Label className="text-sm font-medium">User ID</Label>
                      <Input
                        value={settings.bookingIntegration.userId || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          bookingIntegration: {...settings.bookingIntegration, userId: e.target.value}
                        })}
                        placeholder="Enter your Calendly user ID"
                      />
                    </div>
                  )}
                  
                  {settings.bookingIntegration.platform === 'square' && (
                    <div>
                      <Label className="text-sm font-medium">Location ID</Label>
                      <Input
                        value={settings.bookingIntegration.locationId || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          bookingIntegration: {...settings.bookingIntegration, locationId: e.target.value}
                        })}
                        placeholder="Enter your Square location ID"
                      />
                    </div>
                  )}
                  
                  {settings.bookingIntegration.platform === 'booksy' && (
                    <div>
                      <Label className="text-sm font-medium">Business ID</Label>
                      <Input
                        value={settings.bookingIntegration.businessId || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          bookingIntegration: {...settings.bookingIntegration, businessId: e.target.value}
                        })}
                        placeholder="Enter your Booksy business ID"
                      />
                    </div>
                  )}
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>✨ AI Booking:</strong> When enabled, AI will check your actual calendar availability and book appointments directly into your booking platform!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Greeting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Custom AI Greeting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">AI Greeting Message</Label>
            <Textarea
              value={settings.customGreeting}
              onChange={(e) => setSettings({...settings, customGreeting: e.target.value})}
              rows={3}
              placeholder="Enter the message AI will use to greet customers..."
            />
            <p className="text-sm text-gray-600 mt-2">
              This message will be sent to customers when they first message your business
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Auto-Booking</Label>
                  <div className={`w-2 h-2 rounded-full ${settings.autoBooking ? 'bg-purple-500 shadow-purple-200 shadow-md' : 'bg-gray-400'}`}></div>
                  <span className={`text-xs font-medium ${settings.autoBooking ? 'text-purple-600' : 'text-gray-500'}`}>
                    {settings.autoBooking ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Allow AI to book appointments automatically</p>
              </div>
              <Switch
                checked={settings.autoBooking}
                onCheckedChange={(checked) => setSettings({...settings, autoBooking: checked})}
                className="data-[state=checked]:bg-purple-500 data-[state=unchecked]:bg-gray-300"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Require Confirmation</Label>
                  <div className={`w-2 h-2 rounded-full ${settings.requireConfirmation ? 'bg-blue-500 shadow-blue-200 shadow-md' : 'bg-gray-400'}`}></div>
                  <span className={`text-xs font-medium ${settings.requireConfirmation ? 'text-blue-600' : 'text-gray-500'}`}>
                    {settings.requireConfirmation ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-xs text-gray-600">AI asks for confirmation before booking</p>
              </div>
              <Switch
                checked={settings.requireConfirmation}
                onCheckedChange={(checked) => setSettings({...settings, requireConfirmation: checked})}
                className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
