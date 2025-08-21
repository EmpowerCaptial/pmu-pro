"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Chrome, 
  Globe, 
  CheckCircle,
  Star,
  Zap
} from 'lucide-react'

export default function InstallationGuide() {
  const [activeTab, setActiveTab] = useState('mobile')

  const mobileSteps = [
    {
      step: 1,
      title: "Open in Browser",
      description: "Navigate to PMU Pro in your mobile browser",
      icon: <Smartphone className="h-5 w-5" />
    },
    {
      step: 2,
      title: "Tap Share Button",
      description: "Tap the share button in your browser menu",
      icon: <Download className="h-5 w-5" />
    },
    {
      step: 3,
      title: "Add to Home Screen",
      description: "Select 'Add to Home Screen' or 'Install App'",
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      step: 4,
      title: "Launch App",
      description: "Tap the PMU Pro icon on your home screen",
      icon: <Zap className="h-5 w-5" />
    }
  ]

  const desktopSteps = [
    {
      step: 1,
      title: "Visit PMU Pro",
      description: "Open PMU Pro in your desktop browser",
      icon: <Monitor className="h-5 w-5" />
    },
    {
      step: 2,
      title: "Look for Install Button",
      description: "Click the install button in your browser address bar",
      icon: <Download className="h-5 w-5" />
    },
    {
      step: 3,
      title: "Confirm Installation",
      description: "Click 'Install' in the popup dialog",
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      step: 4,
      title: "Launch from Desktop",
      description: "Find PMU Pro in your applications menu",
      icon: <Zap className="h-5 w-5" />
    }
  ]

  const browserSupport = [
    {
      name: "Chrome",
      icon: <Chrome className="h-6 w-6 text-blue-600" />,
      supported: true,
      version: "67+"
    },
    {
      name: "Edge",
      icon: <Globe className="h-6 w-6 text-blue-500" />,
      supported: true,
      version: "79+"
    },
    {
      name: "Firefox",
      icon: <Globe className="h-6 w-6 text-orange-500" />,
      supported: true,
      version: "67+"
    },
    {
      name: "Safari",
      icon: <Globe className="h-6 w-6 text-blue-500" />,
      supported: true,
      version: "11.1+"
    }
  ]

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Download className="h-6 w-6" />
          Install PMU Pro as an App
        </CardTitle>
        <CardDescription className="text-purple-700">
          Get the full app experience with offline access and home screen installation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
            <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-purple-800">Fast Access</h4>
            <p className="text-sm text-purple-600">Launch from home screen instantly</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-green-800">Works Offline</h4>
            <p className="text-sm text-green-600">Access core features without internet</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h4 className="font-semibold text-yellow-800">Native Feel</h4>
            <p className="text-sm text-yellow-600">App-like experience and performance</p>
          </div>
        </div>

        {/* Installation Steps */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile
            </TabsTrigger>
            <TabsTrigger value="desktop" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Desktop
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mobile" className="space-y-4 mt-4">
            <div className="grid gap-4">
              {mobileSteps.map((step) => (
                <div key={step.step} className="flex items-start gap-4 p-3 bg-white rounded-lg border border-purple-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-semibold">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      {step.icon}
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="desktop" className="space-y-4 mt-4">
            <div className="grid gap-4">
              {desktopSteps.map((step) => (
                <div key={step.step} className="flex items-start gap-4 p-3 bg-white rounded-lg border border-purple-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      {step.icon}
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Browser Support */}
        <div className="bg-white p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-gray-900 mb-3">Browser Compatibility</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {browserSupport.map((browser) => (
              <div key={browser.name} className="text-center p-2">
                <div className="flex items-center justify-center mb-2">
                  {browser.icon}
                </div>
                <p className="text-sm font-medium text-gray-900">{browser.name}</p>
                <Badge 
                  variant={browser.supported ? "default" : "secondary"}
                  className="text-xs mt-1"
                >
                  {browser.supported ? browser.version : "Not Supported"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-sm text-purple-600 mb-3">
            Ready to get the full PMU Pro experience?
          </p>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Install PMU Pro App
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
