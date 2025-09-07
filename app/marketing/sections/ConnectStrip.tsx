'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Facebook, Search, CheckCircle, AlertCircle } from 'lucide-react'

export function ConnectStrip() {
  const [metaStatus, setMetaStatus] = useState<'disconnected' | 'connected' | 'loading'>('disconnected')
  const [googleStatus, setGoogleStatus] = useState<'disconnected' | 'connected' | 'loading'>('disconnected')

  const connectMeta = () => {
    setMetaStatus('loading')
    window.location.href = '/api/oauth/meta/authorize'
  }

  const connectGoogle = () => {
    setGoogleStatus('loading')
    window.location.href = '/api/oauth/google/authorize'
  }

  // Check URL params for connection status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const metaConnect = urlParams.get('connect')
    const googleConnect = urlParams.get('connect')

    if (metaConnect === 'meta_success') {
      setMetaStatus('connected')
    } else if (metaConnect === 'meta_error') {
      setMetaStatus('disconnected')
    }

    if (googleConnect === 'google_success') {
      setGoogleStatus('connected')
    } else if (googleConnect === 'google_error') {
      setGoogleStatus('disconnected')
    }
  }, [])

  return (
    <section className="container mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold mb-4">How It Works</h2>
        <p className="text-lg opacity-80 max-w-2xl mx-auto">
          Connect your ad accounts in 3 simple steps and start growing your bookings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Meta Connection */}
        <Card className="rounded-2xl border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Facebook className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Meta (Facebook & Instagram)</h3>
                  <p className="text-sm opacity-70">Connect your ad account</p>
                </div>
              </div>
              {metaStatus === 'connected' && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
              {metaStatus === 'loading' && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Connecting...
                </Badge>
              )}
            </div>
            
            <Button 
              onClick={connectMeta}
              disabled={metaStatus === 'loading' || metaStatus === 'connected'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3"
            >
              {metaStatus === 'connected' ? 'Manage Connection' : 'Connect Meta'}
            </Button>
          </CardContent>
        </Card>

        {/* Google Connection */}
        <Card className="rounded-2xl border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Google Ads</h3>
                  <p className="text-sm opacity-70">Connect your ad account</p>
                </div>
              </div>
              {googleStatus === 'connected' && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
              {googleStatus === 'loading' && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Connecting...
                </Badge>
              )}
            </div>
            
            <Button 
              onClick={connectGoogle}
              disabled={googleStatus === 'loading' || googleStatus === 'connected'}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3"
            >
              {googleStatus === 'connected' ? 'Manage Connection' : 'Connect Google Ads'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#C6AA76] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">1</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Connect</h3>
          <p className="opacity-80">Link your Meta and Google ad accounts with one click</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-[#C6AA76] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">2</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Launch</h3>
          <p className="opacity-80">Use proven PMU campaign templates for Lead Ads and Search</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-[#C6AA76] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">3</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Convert</h3>
          <p className="opacity-80">AI replies book consults fast with instant responses</p>
        </div>
      </div>
    </section>
  )
}
