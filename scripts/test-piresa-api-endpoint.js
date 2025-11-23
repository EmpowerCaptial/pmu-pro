#!/usr/bin/env node

/**
 * Test the actual /api/auth/login endpoint
 * This simulates exactly what the frontend does
 */

const fetch = require('node-fetch')

async function testApiEndpoint() {
  try {
    console.log('🔍 TESTING ACTUAL API ENDPOINT')
    console.log('==============================\n')

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'
    const email = 'piresa@universalbeautystudio.com'
    const password = 'piresa2024'

    console.log(`📡 Testing: ${baseUrl}/api/auth/login`)
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}\n`)

    // Test 1: Normal request
    console.log('📊 Test 1: Normal API request...')
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    
    console.log(`   Status: ${response.status}`)
    console.log(`   Response:`, JSON.stringify(data, null, 2))
    
    if (data.success && data.user) {
      console.log('\n✅ LOGIN SUCCESSFUL!')
      console.log(`   User: ${data.user.name}`)
      console.log(`   Email: ${data.user.email}`)
      console.log(`   Role: ${data.user.role}`)
    } else {
      console.log('\n❌ LOGIN FAILED!')
      console.log(`   Error: ${data.error || 'Unknown error'}`)
    }

    // Test 2: With trimmed email (in case of spaces)
    console.log('\n📊 Test 2: With trimmed email...')
    const trimmedEmail = email.trim()
    const response2 = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: trimmedEmail, password }),
    })

    const data2 = await response2.json()
    console.log(`   Status: ${response2.status}`)
    if (data2.success) {
      console.log('   ✅ Login successful with trimmed email!')
    } else {
      console.log(`   ❌ Failed: ${data2.error}`)
    }

    // Test 3: With lowercase email
    console.log('\n📊 Test 3: With lowercase email...')
    const lowerEmail = email.toLowerCase()
    const response3 = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: lowerEmail, password }),
    })

    const data3 = await response3.json()
    console.log(`   Status: ${response3.status}`)
    if (data3.success) {
      console.log('   ✅ Login successful with lowercase email!')
    } else {
      console.log(`   ❌ Failed: ${data3.error}`)
    }

    // Test 4: Check if email has hidden characters
    console.log('\n📊 Test 4: Email analysis...')
    console.log(`   Original: "${email}"`)
    console.log(`   Length: ${email.length}`)
    console.log(`   Char codes: ${email.split('').map(c => c.charCodeAt(0)).join(', ')}`)
    console.log(`   Has non-ASCII: ${/[^\x00-\x7F]/.test(email) ? 'YES ⚠️' : 'NO ✅'}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
  }
}

testApiEndpoint()

