#!/usr/bin/env node

/**
 * Script to test Tyrone's login via the actual API
 */

async function testLoginAPI() {
  try {
    console.log('🔍 Testing Tyrone Jackson login via API...')
    console.log('📧 Email: tyronejackboy@gmail.com')
    console.log('🔑 Password: Tyronej22!')
    console.log('---')

    // Test the login API
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'tyronejackboy@gmail.com',
        password: 'Tyronej22!'
      })
    })

    console.log('📡 API Response Status:', loginResponse.status)
    console.log('📡 API Response Headers:', Object.fromEntries(loginResponse.headers.entries()))

    const responseData = await loginResponse.json()
    console.log('📡 API Response Data:', JSON.stringify(responseData, null, 2))

    if (loginResponse.ok) {
      console.log('✅ LOGIN SUCCESSFUL!')
      console.log('🎉 User authenticated successfully')
    } else {
      console.log('❌ LOGIN FAILED!')
      console.log('💡 Error:', responseData.error)
      
      // Test with different email cases
      console.log('---')
      console.log('🔍 Testing with different email cases...')
      
      const emailVariations = [
        'Tyronejackboy@gmail.com',
        'TYRONEJACKBOY@GMAIL.COM',
        'tyronejackboy@GMAIL.COM'
      ]
      
      for (const email of emailVariations) {
        console.log(`Testing email: ${email}`)
        
        const testResponse = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: 'Tyronej22!'
          })
        })
        
        const testData = await testResponse.json()
        console.log(`  Status: ${testResponse.status}, Result: ${testResponse.ok ? 'SUCCESS' : 'FAILED'}`)
        if (!testResponse.ok) {
          console.log(`  Error: ${testData.error}`)
        }
      }
    }

  } catch (error) {
    console.error('❌ Error testing login API:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Server is not running locally')
      console.log('💡 Try running: npm run dev')
      console.log('💡 Or test on the live site: https://thepmuguide.com')
    }
  }
}

// Run the test
testLoginAPI()
  .then(() => {
    console.log('✅ Test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
