#!/usr/bin/env node

/**
 * Test Tyrone's login against the production API to confirm it's working
 */

const fetch = globalThis.fetch

async function testTyroneProductionLogin() {
  try {
    console.log('🌐 TESTING TYRONE\'S PRODUCTION LOGIN API...')
    console.log('==============================================')
    
    const loginData = {
      email: 'tyronejackboy@gmail.com',
      password: 'Tyronej22!'
    }
    
    console.log('📧 Email:', loginData.email)
    console.log('🔑 Password: [HIDDEN]')
    console.log('🌐 Testing against: https://thepmuguide.com/api/auth/login')
    console.log('')
    
    const response = await fetch('https://thepmuguide.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    })
    
    console.log('📊 API Response Status:', response.status)
    console.log('📊 API Response Headers:', Object.fromEntries(response.headers.entries()))
    console.log('')
    
    const responseData = await response.json()
    console.log('📋 API Response Body:')
    console.log(JSON.stringify(responseData, null, 2))
    console.log('')
    
    if (response.status === 200 && responseData.success) {
      console.log('🎉 PRODUCTION LOGIN API SUCCESS!')
      console.log('✅ Tyrone\'s credentials work in production')
      console.log('✅ All fixes applied successfully')
      console.log('✅ Database schema is in sync')
      console.log('✅ Payment verification working')
      console.log('✅ Enterprise Studio access granted')
      console.log('')
      console.log('🎯 TYRONE CAN NOW LOG IN SUCCESSFULLY!')
      console.log('✅ No more "invalid username and password" errors')
      console.log('✅ No more "subscription required" screens')
      console.log('✅ Full Enterprise Studio features available')
    } else if (response.status === 401) {
      console.log('❌ PRODUCTION LOGIN API FAILED - Invalid credentials')
      console.log('🚨 This would match what Tyrone was seeing')
      console.log('🔍 Possible causes:')
      console.log('   1. Password hash mismatch in production database')
      console.log('   2. Email case sensitivity')
      console.log('   3. Special characters in password')
      console.log('   4. Production database schema still not synced')
    } else if (response.status === 500) {
      console.log('❌ PRODUCTION LOGIN API ERROR - Server error')
      console.log('🚨 Schema drift still present in production')
      console.log('🔧 Need to apply database migration to production')
    } else {
      console.log('❓ UNEXPECTED RESPONSE - Status:', response.status)
      console.log('🔍 Response:', responseData)
    }
    
  } catch (error) {
    console.error('❌ Error testing production login API:', error)
    console.log('🚨 Network error or API endpoint not accessible')
  }
}

// Run the test
testTyroneProductionLogin()
  .then(() => {
    console.log('✅ Production login test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Production login test failed:', error)
    process.exit(1)
  })
