#!/usr/bin/env node

/**
 * Test the actual magic link API endpoint to see what's happening
 */

// Use built-in fetch (Node 18+)
const fetch = globalThis.fetch

async function testMagicLinkAPI() {
  try {
    console.log('🧪 TESTING MAGIC LINK API ENDPOINT...')
    console.log('=====================================')
    
    // Get a fresh token for Tyrone
    console.log('🔗 Getting fresh magic link token...')
    
    const response = await fetch('https://thepmuguide.com/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'tyronejackboy@gmail.com'
      })
    })
    
    const signinResult = await response.json()
    console.log('📧 Signin response:', signinResult)
    
    if (signinResult.success && signinResult.token) {
      console.log('✅ Magic link token generated:', signinResult.token.substring(0, 20) + '...')
      
      // Now test the verify endpoint
      console.log('')
      console.log('🔍 Testing /api/auth/verify endpoint...')
      
      const verifyResponse = await fetch('https://thepmuguide.com/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: signinResult.token
        })
      })
      
      const verifyResult = await verifyResponse.json()
      console.log('🔍 Verify response status:', verifyResponse.status)
      console.log('🔍 Verify response:', verifyResult)
      
      if (verifyResponse.status === 403) {
        console.log('❌ ACCESS DENIED - This is why Tyrone sees "subscription required"')
        console.log('🚨 The payment verification is blocking access in production')
      } else if (verifyResponse.status === 200 && verifyResult.success) {
        console.log('✅ ACCESS GRANTED - Magic link should work')
      } else {
        console.log('❓ Unexpected response - investigate further')
      }
    } else {
      console.log('❌ Failed to generate magic link token')
    }
    
  } catch (error) {
    console.error('❌ Error testing magic link API:', error)
  }
}

// Run the test
testMagicLinkAPI()
  .then(() => {
    console.log('✅ API test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ API test failed:', error)
    process.exit(1)
  })
