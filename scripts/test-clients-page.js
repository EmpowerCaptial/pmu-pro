#!/usr/bin/env node

/**
 * Test script to simulate login and test clients page
 */

const BASE_URL = 'https://pmu-n70wr6bfp-tyronejackboy-9924s-projects.vercel.app'

async function testClientsPage() {
  console.log('🧪 Testing Clients Page Functionality')
  console.log('=====================================')
  
  try {
    // Step 1: Test API directly
    console.log('1️⃣ Testing clients API directly...')
    const apiResponse = await fetch(`${BASE_URL}/api/clients`, {
      headers: {
        'x-user-email': 'universalbeautystudioacademy@gmail.com',
        'Accept': 'application/json'
      }
    })
    
    if (!apiResponse.ok) {
      throw new Error(`API failed: ${apiResponse.status} ${apiResponse.statusText}`)
    }
    
    const apiData = await apiResponse.json()
    console.log('✅ API Response:', {
      clientsCount: apiData.clients?.length || 0,
      firstClient: apiData.clients?.[0]?.name || 'None'
    })
    
    // Step 2: Test database connection
    console.log('\n2️⃣ Testing database connection...')
    const dbResponse = await fetch(`${BASE_URL}/api/test-db`, {
      headers: {
        'x-user-email': 'universalbeautystudioacademy@gmail.com'
      }
    })
    
    if (!dbResponse.ok) {
      throw new Error(`Database test failed: ${dbResponse.status}`)
    }
    
    const dbData = await dbResponse.json()
    console.log('✅ Database Status:', {
      success: dbData.success,
      userEmail: dbData.user?.email,
      clientsCount: dbData.clientsCount
    })
    
    // Step 3: Test clients page HTML
    console.log('\n3️⃣ Testing clients page HTML...')
    const pageResponse = await fetch(`${BASE_URL}/clients`)
    
    if (!pageResponse.ok) {
      throw new Error(`Page failed: ${pageResponse.status}`)
    }
    
    const pageHtml = await pageResponse.text()
    const hasClientList = pageHtml.includes('ClientList') || pageHtml.includes('client')
    console.log('✅ Page Status:', {
      status: pageResponse.status,
      hasClientComponents: hasClientList,
      pageSize: pageHtml.length
    })
    
    // Step 4: Summary
    console.log('\n📊 Test Summary:')
    console.log('================')
    console.log(`✅ API Working: ${apiData.clients?.length > 0 ? 'YES' : 'NO'}`)
    console.log(`✅ Database Connected: ${dbData.success ? 'YES' : 'NO'}`)
    console.log(`✅ Page Loads: ${pageResponse.ok ? 'YES' : 'NO'}`)
    console.log(`✅ Clients Available: ${apiData.clients?.length || 0} clients`)
    
    if (apiData.clients?.length > 0) {
      console.log('\n🎉 SUCCESS: Clients page should work properly!')
      console.log('\n📋 Available Clients:')
      apiData.clients.forEach((client, index) => {
        console.log(`   ${index + 1}. ${client.name} (${client.email})`)
      })
    } else {
      console.log('\n❌ ISSUE: No clients found')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testClientsPage()
