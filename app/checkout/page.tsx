"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  User, 
  FileText, 
  ShoppingCart,
  Home,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import ServiceCheckout from '@/components/checkout/service-checkout'
import { useDemoAuth } from '@/hooks/use-demo-auth'

export default function CheckoutPage() {
  const { currentUser } = useDemoAuth()
  const [activeTab, setActiveTab] = useState('checkout')

  // Mock artist data - replace with actual user data
  const currentArtist = {
    id: currentUser?.id || 'demo_artist',
    name: currentUser?.name || 'Demo Artist',
    email: currentUser?.email || 'demo@pmupro.com'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-beige/10">
      {/* Header */}
      <div className="bg-white border-b border-lavender/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-lavender hover:bg-lavender/5">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-ink">Service Checkout</h1>
                <p className="text-ink/70">Complete client screening and process payments</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Artist: {currentArtist.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-lavender/20">
            <TabsTrigger 
              value="checkout" 
              className="data-[state=active]:bg-lavender data-[state=active]:text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Service Checkout
            </TabsTrigger>
            <TabsTrigger 
              value="screening" 
              className="data-[state=active]:bg-lavender data-[state=active]:text-white"
            >
              <User className="h-4 w-4 mr-2" />
              Client Screening
            </TabsTrigger>
            <TabsTrigger 
              value="intake" 
              className="data-[state=active]:bg-lavender data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              PMU Intake
            </TabsTrigger>
          </TabsList>

          {/* Service Checkout Tab */}
          <TabsContent value="checkout" className="space-y-6">
            <Card className="border-lavender/20 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lavender-700">
                  <CreditCard className="h-5 w-5" />
                  Service Checkout & Payment
                </CardTitle>
                <CardDescription>
                  Select services, choose clients, customize pricing, and process payments with Stripe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ServiceCheckout 
                  currentArtist={currentArtist}
                  onCheckoutComplete={(session) => {
                    console.log('Checkout completed:', session)
                    // Handle checkout completion
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Client Screening Tab */}
          <TabsContent value="screening" className="space-y-6">
            <Card className="border-lavender/20 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lavender-700">
                  <User className="h-5 w-5" />
                  Client Screening & Assessment
                </CardTitle>
                <CardDescription>
                  Comprehensive client screening including medical history, skin analysis, and suitability assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Screening Overview */}
                  <div className="bg-lavender/5 p-6 rounded-lg border border-lavender/20">
                    <h3 className="text-lg font-semibold mb-4 text-lavender-700">
                      Client Screening Process
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Medical Assessment</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li>• Medical history review</li>
                          <li>• Current medications</li>
                          <li>• Allergies and sensitivities</li>
                          <li>• Skin conditions</li>
                          <li>• Previous procedures</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Skin Analysis</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li>• Fitzpatrick skin type</li>
                          <li>• Undertone assessment</li>
                          <li>• Skin texture evaluation</li>
                          <li>• Pigment compatibility</li>
                          <li>• Healing potential</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Screening Tools */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-lavender/20 hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">Skin Analysis Tool</CardTitle>
                        <CardDescription>
                          Advanced skin analysis using AI and scientific classification
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          className="w-full bg-lavender hover:bg-lavender-600 text-white"
                          onClick={() => window.open('/analyze', '_blank')}
                        >
                          Launch Skin Analysis
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-lavender/20 hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">Medical History Form</CardTitle>
                        <CardDescription>
                          Comprehensive medical history and consent forms
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          variant="outline" 
                          className="w-full border-lavender text-lavender hover:bg-lavender/5"
                          onClick={() => window.open('/standard-documents', '_blank')}
                        >
                          View Forms
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Integration Note */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Integration with Checkout</h4>
                    <p className="text-sm text-blue-700">
                      Client screening results are automatically integrated into the service checkout process. 
                      Complete screening first to ensure proper service recommendations and pricing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PMU Intake Tab */}
          <TabsContent value="intake" className="space-y-6">
            <Card className="border-lavender/20 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lavender-700">
                  <FileText className="h-5 w-5" />
                  PMU Intake & Documentation
                </CardTitle>
                <CardDescription>
                  Complete intake forms, consent documents, and service planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Intake Overview */}
                  <div className="bg-lavender/5 p-6 rounded-lg border border-lavender/20">
                    <h3 className="text-lg font-semibold mb-4 text-lavender-700">
                      Intake Process Overview
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-lavender/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-lavender font-bold text-lg">1</span>
                        </div>
                        <h4 className="font-medium text-sm">Client Information</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Personal details, contact info, and preferences
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-lavender/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-lavender font-bold text-lg">2</span>
                        </div>
                        <h4 className="font-medium text-sm">Service Planning</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Design consultation and service customization
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-lavender/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-lavender font-bold text-lg">3</span>
                        </div>
                        <h4 className="font-medium text-sm">Documentation</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Consent forms and legal documentation
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Intake Tools */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-lavender/20 hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">Client Intake Forms</CardTitle>
                        <CardDescription>
                          Comprehensive client information and preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          className="w-full bg-lavender hover:bg-lavender-600 text-white"
                          onClick={() => window.open('/clients/new', '_blank')}
                        >
                          Create New Client
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-lavender/20 hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">Consent Documents</CardTitle>
                        <CardDescription>
                          Legal consent forms and service agreements
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          variant="outline" 
                          className="w-full border-lavender text-lavender hover:bg-lavender/5"
                          onClick={() => window.open('/standard-documents', '_blank')}
                        >
                          Access Documents
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Workflow Integration */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Complete Workflow</h4>
                    <p className="text-sm text-green-700">
                      The intake process feeds directly into service checkout. Complete all forms and assessments 
                      before proceeding to payment to ensure accurate service planning and pricing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-12">
          <Card className="border-lavender/20 bg-white">
            <CardHeader>
              <CardTitle className="text-lavender-700">Quick Actions</CardTitle>
              <CardDescription>
                Access frequently used tools and features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="border-lavender text-lavender hover:bg-lavender/5 h-auto py-4 flex-col"
                  onClick={() => window.open('/clients', '_blank')}
                >
                  <User className="h-6 w-6 mb-2" />
                  <span className="text-sm">Client Management</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-lavender text-lavender hover:bg-lavender/5 h-auto py-4 flex-col"
                  onClick={() => window.open('/analyze', '_blank')}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">Skin Analysis</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-lavender text-lavender hover:bg-lavender/5 h-auto py-4 flex-col"
                  onClick={() => window.open('/standard-documents', '_blank')}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">Documents</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-lavender text-lavender hover:bg-lavender/5 h-auto py-4 flex-col"
                  onClick={() => window.open('/dashboard', '_blank')}
                >
                  <Home className="h-6 w-6 mb-2" />
                  <span className="text-sm">Dashboard</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
