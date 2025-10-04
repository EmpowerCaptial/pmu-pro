#!/usr/bin/env node

/**
 * Test Tyrone's login against the actual API endpoint
 */

const fetch = globalThis.fetch

async function testTyroneLoginAPI() {
  try {
    console.log('🧪 TESTING TYRONE\'S LOGIN AGAINST ACTUAL API...')
    console.log('================================================')
    
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
      console.log('✅ LOGIN API SUCCESS!')
      console.log('✅ Tyrone\'s credentials work on the backend')
      console.log('❓ If frontend shows "invalid username and password":')
      console.log('   1. Frontend JavaScript error')
      console.log('   2. Browser cache issue')
      console.log('   3. Network/firewall blocking')
      console.log('   4. User input error (typos)')
      console.log('   5. Different API endpoint being called')
    } else if (response.status === 401) {
      console.log('❌ LOGIN API FAILED - Invalid credentials')
      console.log('🚨 This matches what Tyrone is seeing')
      console.log('🔍 Possible causes:')
      console.log('   1. Password hash mismatch in database')
      console.log('   2. Email case sensitivity')
      console.log('   3. Special characters in password')
      console.log('   4. Database connection issue')
    } else if (response.status === 400) {
      console.log('⚠️ LOGIN API ERROR - Bad request')
      console.log('🚨 Missing required fields or validation error')
    } else if (response.status === 500) {
      console.log('❌ LOGIN API ERROR - Server error')
      console.log('🚨 Internal server error or database issue')
    } else {
      console.log('❓ UNEXPECTED RESPONSE - Status:', response.status)
    }
    
    // Test with slight variations to see if it's a case/typo issue
    console.log('')
    console.log('🔍 TESTING PASSWORD VARIATIONS:')
    
    const variations = [
      'Tyronej22',
      'tyronej22!',
      'TYRONEJ22!',
      'Tyronej22@',
      'Tyrone22!'
    ]
    
    for (const password of variations) {
      try {
        const testResponse = await fetch('https://thepmuguide.com/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'tyronejackboy@gmail.com',
            password: password
          })
        })
        
        const testData = await testResponse.json()
        if (testResponse.status === 200 && testData.success) {
          console.log(`✅ FOUND WORKING PASSWORD: "${password}"`)
          break
        } else {
          console.log(`❌ "${password}" - ${testResponse.status} ${testData.error || 'failed'}`)
        }
      } catch (error) {
        console.log(`❌ "${password}" - Network error`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing login API:', error)
    console.log('🚨 Network error or API endpoint not accessible')
  }
}

// Run the test
testTyroneLoginAPI()
  .then(() => {
    console.log('✅ API test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ API test failed:', error)
    process.exit(1)
  })