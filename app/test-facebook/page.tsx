"use client"

import { useState } from 'react'

export default function TestFacebookPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const testFacebookConfig = () => {
    const redirectUri = `${window.location.origin}/integrations/meta/callback`
    const clientId = process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID
    
    const info = {
      clientId,
      redirectUri,
      origin: window.location.origin,
      hasClientId: !!clientId,
      expectedRedirectUri: 'https://thepmuguide.com/integrations/meta/callback',
      isProduction: window.location.origin === 'https://thepmuguide.com'
    }
    
    setDebugInfo(info)
    
    console.log('=== FACEBOOK CONFIG TEST ===')
    console.log('Client ID:', clientId)
    console.log('Redirect URI:', redirectUri)
    console.log('Origin:', window.location.origin)
    console.log('Expected URI:', 'https://thepmuguide.com/integrations/meta/callback')
    console.log('============================')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Facebook OAuth Configuration Test</h1>
      
      <button 
        onClick={testFacebookConfig}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-6"
      >
        Test Facebook Configuration
      </button>
      
      {debugInfo && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Configuration Debug Info:</h2>
          <pre className="text-sm">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Required Facebook App Settings:</h2>
        <div className="bg-yellow-100 p-4 rounded">
          <p className="font-semibold">Valid OAuth Redirect URIs:</p>
          <ul className="list-disc list-inside mt-2">
            <li><code>https://thepmuguide.com/integrations/meta/callback</code></li>
            <li><code>https://pmu-pro.vercel.app/integrations/meta/callback</code></li>
          </ul>
        </div>
        
        <div className="bg-blue-100 p-4 rounded mt-4">
          <p className="font-semibold">Required Permissions:</p>
          <ul className="list-disc list-inside mt-2">
            <li>email (Basic)</li>
            <li>public_profile (Basic)</li>
            <li>pages_show_list (Advanced - needs approval)</li>
            <li>pages_read_engagement (Advanced - needs approval)</li>
            <li>pages_manage_metadata (Advanced - needs approval)</li>
            <li>instagram_basic (Advanced - needs approval)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
