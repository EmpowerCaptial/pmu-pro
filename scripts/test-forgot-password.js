#!/usr/bin/env node

/**
 * Script to test the forgot password functionality for Tyrone
 */

async function testForgotPassword() {
  try {
    console.log('🔍 Testing forgot password functionality...')
    console.log('📧 Email: tyronejackboy@gmail.com')
    console.log('---')

    // Test the signin/magic link API
    const signinResponse = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'tyronejackboy@gmail.com'
      })
    })

    console.log('📡 Signin API Response Status:', signinResponse.status)
    const responseData = await signinResponse.json()
    console.log('📡 Signin API Response Data:', JSON.stringify(responseData, null, 2))

    if (signinResponse.ok) {
      console.log('✅ FORGOT PASSWORD SUCCESSFUL!')
      console.log('🎉 Magic link should be sent to email')
    } else {
      console.log('❌ FORGOT PASSWORD FAILED!')
      console.log('💡 Error:', responseData.error || responseData.message)
      
      if (responseData.verificationPending) {
        console.log('🔍 ISSUE: License verification pending')
        console.log('💡 Tyrone needs to have his license verified first')
      }
      
      if (responseData.requiresPayment) {
        console.log('🔍 ISSUE: Payment required')
        console.log('💡 Tyrone needs an active subscription')
      }
    }

  } catch (error) {
    console.error('❌ Error testing forgot password:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Server is not running locally')
      console.log('💡 Try running: npm run dev')
      console.log('💡 Or test on the live site: https://thepmuguide.com')
    }
  }
}

// Run the test
testForgotPassword()
  .then(() => {
    console.log('✅ Test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
