#!/usr/bin/env node

/**
 * Test login for user Ty with correct password "testing"
 */

console.log('🔍 TESTING CORRECT LOGIN FOR USER: Ty')
console.log('=====================================')

async function testTyCorrectLogin() {
  const loginData = {
    email: 'tierra@universalbeautystudio.com',
    password: 'testing'
  }
  
  console.log('\n📋 Login Credentials:')
  console.log(`Email: ${loginData.email}`)
  console.log(`Password: ${loginData.password}`)
  
  try {
    console.log('\n🚀 Attempting login...')
    
    const response = await fetch('https://thepmuguide.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    })
    
    console.log(`Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ LOGIN SUCCESSFUL!')
      console.log('\n👤 User Details:')
      console.log(`ID: ${data.user.id}`)
      console.log(`Name: ${data.user.name}`)
      console.log(`Email: ${data.user.email}`)
      console.log(`Role: ${data.user.role}`)
      console.log(`Business Name: ${data.user.businessName}`)
      console.log(`Selected Plan: ${data.user.selectedPlan}`)
      console.log(`Has Active Subscription: ${data.user.hasActiveSubscription}`)
      console.log(`Is License Verified: ${data.user.isLicenseVerified}`)
      console.log(`Subscription Status: ${data.user.subscriptionStatus}`)
      
      return data.user
      
    } else {
      const errorData = await response.text()
      console.log('❌ LOGIN FAILED:')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
      return null
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message)
    return null
  }
}

async function testTyInstructorAccess() {
  console.log('\n🎓 TESTING TY\'S ACCESS TO INSTRUCTORS...')
  
  try {
    const response = await fetch('https://thepmuguide.com/api/studio/instructors', {
      method: 'GET',
      headers: {
        'x-user-email': 'tierra@universalbeautystudio.com'
      }
    })
    
    console.log(`API Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Ty can access instructors API!')
      console.log(`Success: ${data.success}`)
      console.log(`Studio: ${data.studioName}`)
      console.log(`Instructors Found: ${data.instructors?.length || 0}`)
      
      if (data.instructors && data.instructors.length > 0) {
        console.log('\n📋 Instructors available to Ty:')
        data.instructors.forEach((instructor, index) => {
          console.log(`${index + 1}. ${instructor.name} (${instructor.role})`)
          console.log(`   Email: ${instructor.email}`)
        })
      } else {
        console.log('⚠️ No instructors found in database')
      }
      
    } else {
      const errorData = await response.text()
      console.log('❌ Ty cannot access instructors API:')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
    }
    
  } catch (error) {
    console.log('❌ API access error:', error.message)
  }
}

async function testLocalStorageFix() {
  console.log('\n💾 TESTING LOCALSTORAGE FIX FOR TY...')
  
  try {
    const response = await fetch('https://thepmuguide.com/api/populate-instructors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ studioName: 'Universal Beauty Studio' })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Instructors data ready for localStorage')
      console.log(`Instructors: ${data.instructors.length}`)
      
      data.instructors.forEach((instructor, index) => {
        console.log(`${index + 1}. ${instructor.name} (${instructor.role})`)
      })
      
      console.log('\n📋 LOCALSTORAGE DATA FOR TY:')
      console.log('Key: "studio-instructors"')
      console.log('Value:', data.localStorageValue)
      
      return data
    } else {
      console.log('❌ Failed to get instructors data')
      return null
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message)
    return null
  }
}

async function runFullTest() {
  console.log('🎯 FULL TEST FOR USER TY - TIERRA JACKSON VISIBILITY')
  console.log('===================================================')
  
  // Step 1: Test login
  const user = await testTyCorrectLogin()
  
  if (user) {
    // Step 2: Test instructor access
    await testTyInstructorAccess()
    
    // Step 3: Test localStorage fix
    const instructorsData = await testLocalStorageFix()
    
    console.log('\n🎯 DIAGNOSIS:')
    console.log('=============')
    console.log('✅ Ty can log in successfully')
    console.log(`✅ Ty's role: ${user.role}`)
    console.log(`✅ Ty's studio: ${user.businessName}`)
    console.log(`✅ Ty's plan: ${user.selectedPlan}`)
    
    if (user.role === 'student') {
      console.log('\n🎓 Ty is a STUDENT - should see instructors for supervision booking')
      console.log('❌ ISSUE: Ty cannot see Tierra Jackson as instructor')
      console.log('🔧 SOLUTION: Use the debug button or manual localStorage fix')
      
      if (instructorsData) {
        console.log('\n🚀 IMMEDIATE FIX:')
        console.log('================')
        console.log('1. Ty should go to Studio → Supervision page')
        console.log('2. Click the "🔧 Populate Instructors (Debug)" button')
        console.log('3. Page will refresh and show Tierra Jackson')
        console.log('4. OR manually add this to localStorage:')
        console.log(`   Key: "studio-instructors"`)
        console.log(`   Value: ${instructorsData.localStorageValue}`)
      }
    }
    
  } else {
    console.log('\n❌ Ty cannot log in - need to check credentials')
  }
}

runFullTest().catch(console.error)
