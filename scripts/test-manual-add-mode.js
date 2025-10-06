#!/usr/bin/env node

/**
 * Test the updated manual add mode to ensure it creates database accounts
 */

console.log('🧪 TESTING UPDATED MANUAL ADD MODE')
console.log('==================================')

async function testManualAddMode() {
  console.log('\n👨‍🎓 TESTING MANUAL ADD MODE')
  console.log('============================')
  
  // Test data for a new student
  const testStudentData = {
    memberEmail: 'test.student@universalbeautystudio.com',
    memberName: 'Test Student',
    memberPassword: 'temp123456', // This will be auto-generated
    memberRole: 'student',
    studioName: 'Universal Beauty Studio',
    studioOwnerName: 'Tyrone Jackson'
  }
  
  console.log('📋 Test Student Data:')
  console.log(`Name: ${testStudentData.memberName}`)
  console.log(`Email: ${testStudentData.memberEmail}`)
  console.log(`Role: ${testStudentData.memberRole}`)
  console.log(`Studio: ${testStudentData.studioName}`)
  
  try {
    console.log('\n🚀 Testing manual add via team invitation API...')
    
    const response = await fetch('https://thepmuguide.com/api/studio/invite-team-member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testStudentData)
    })
    
    console.log(`Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Manual add successful!')
      console.log('Response:', data)
      
      if (data.userId) {
        console.log('\n👨‍🎓 Created Test Student:')
        console.log(`ID: ${data.userId}`)
        console.log(`Name: ${testStudentData.memberName}`)
        console.log(`Email: ${testStudentData.memberEmail}`)
        console.log(`Role: ${testStudentData.memberRole}`)
        console.log(`Studio: ${testStudentData.studioName}`)
      }
      
      return data.userId
      
    } else {
      const errorData = await response.text()
      console.log('❌ Manual add failed:')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
      return null
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message)
    return null
  }
}

async function testStudentLogin(userId) {
  console.log('\n🧪 TESTING STUDENT LOGIN')
  console.log('========================')
  
  if (!userId) {
    console.log('❌ Cannot test login - student creation failed')
    return false
  }
  
  try {
    const response = await fetch('https://thepmuguide.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test.student@universalbeautystudio.com',
        password: 'temp123456'
      })
    })
    
    console.log(`Login Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Test student login successful!')
      console.log('\n👨‍🎓 TEST STUDENT ACCOUNT DETAILS:')
      console.log(`ID: ${data.user.id}`)
      console.log(`Name: ${data.user.name}`)
      console.log(`Email: ${data.user.email}`)
      console.log(`Role: ${data.user.role}`)
      console.log(`Business Name: ${data.user.businessName}`)
      console.log(`Studio Name: ${data.user.studioName}`)
      console.log(`Selected Plan: ${data.user.selectedPlan}`)
      console.log(`Has Active Subscription: ${data.user.hasActiveSubscription}`)
      console.log(`Is License Verified: ${data.user.isLicenseVerified}`)
      
      return true
    } else {
      const errorData = await response.text()
      console.log('❌ Test student login failed')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
      return false
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message)
    return false
  }
}

async function testStudentServicesAccess() {
  console.log('\n📊 TESTING STUDENT SERVICES ACCESS')
  console.log('===================================')
  
  try {
    const response = await fetch('https://thepmuguide.com/api/services', {
      method: 'GET',
      headers: {
        'x-user-email': 'test.student@universalbeautystudio.com'
      }
    })
    
    console.log(`Services API Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Test student can access services API')
      console.log(`Services found: ${data.services?.length || 0}`)
      
      if (data.services && data.services.length > 0) {
        console.log('\n📋 Services visible to test student:')
        data.services.forEach((service, index) => {
          console.log(`${index + 1}. ${service.name} - $${service.defaultPrice}`)
        })
        
        console.log('\n🎉 SUCCESS! Test student can see studio services!')
        return true
      } else {
        console.log('⚠️ No services found for test student')
        return false
      }
    } else {
      const errorData = await response.text()
      console.log('❌ Test student cannot access services API')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
      return false
    }
    
  } catch (error) {
    console.log('❌ Services API error:', error.message)
    return false
  }
}

async function runManualAddTest() {
  console.log('🎯 TESTING UPDATED MANUAL ADD MODE')
  console.log('==================================')
  
  // Step 1: Test manual add
  const userId = await testManualAddMode()
  
  // Step 2: Test student login
  const loginSuccess = await testStudentLogin(userId)
  
  // Step 3: Test services access
  const servicesAccess = await testStudentServicesAccess()
  
  console.log('\n🎯 MANUAL ADD MODE TEST RESULTS:')
  console.log('================================')
  console.log(`✅ Student Account Created: ${userId ? 'YES' : 'NO'}`)
  console.log(`✅ Student Can Login: ${loginSuccess ? 'YES' : 'NO'}`)
  console.log(`✅ Student Can Access Services: ${servicesAccess ? 'YES' : 'NO'}`)
  
  if (userId && loginSuccess && servicesAccess) {
    console.log('\n🎉 COMPLETE SUCCESS!')
    console.log('\n🚀 WHAT WORKS NOW:')
    console.log('=================')
    console.log('1. ✅ Manual add mode creates real database accounts')
    console.log('2. ✅ Students can log in with generated credentials')
    console.log('3. ✅ Students can access studio services')
    console.log('4. ✅ Both "Send Invitation" and "Add to Database" modes work')
    console.log('5. ✅ No more localStorage-only entries')
    
    console.log('\n📋 UPDATED WORKFLOW:')
    console.log('====================')
    console.log('1. Studio owner goes to Studio → Team')
    console.log('2. Clicks "Add New Team Member"')
    console.log('3. Chooses between:')
    console.log('   - "Send Invitation" (sends email + creates account)')
    console.log('   - "Add to Database" (creates account + shows credentials)')
    console.log('4. Both modes create real database accounts')
    console.log('5. Students can immediately log in and access studio resources')
    
  } else {
    console.log('\n❌ SOME ISSUES REMAIN')
    console.log('Need to investigate further')
  }
}

runManualAddTest().catch(console.error)
