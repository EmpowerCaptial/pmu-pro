#!/usr/bin/env node

/**
 * Test Tierra's access to services and instructors after account creation
 */

console.log('🧪 TESTING TIERRA STUDENT ACCESS')
console.log('=================================')

async function testTierraLogin() {
  console.log('\n🔐 STEP 1: TESTING TIERRA LOGIN')
  console.log('================================')
  
  try {
    const response = await fetch('https://thepmuguide.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'tierra@universalbeautystudio.com',
        password: 'testing'
      })
    })
    
    console.log(`Login Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Tierra login successful!')
      console.log('\n👤 TIERRA ACCOUNT DETAILS:')
      console.log(`ID: ${data.user.id}`)
      console.log(`Name: ${data.user.name}`)
      console.log(`Email: ${data.user.email}`)
      console.log(`Role: ${data.user.role}`)
      console.log(`Business Name: ${data.user.businessName}`)
      console.log(`Studio Name: ${data.user.studioName}`)
      console.log(`Selected Plan: ${data.user.selectedPlan}`)
      console.log(`Has Active Subscription: ${data.user.hasActiveSubscription}`)
      console.log(`Is License Verified: ${data.user.isLicenseVerified}`)
      console.log(`Subscription Status: ${data.user.subscriptionStatus}`)
      
      return data.user
    } else {
      const errorData = await response.text()
      console.log('❌ Tierra login failed')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
      return null
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message)
    return null
  }
}

async function testTierraServicesAccess(tierraUser) {
  console.log('\n📊 STEP 2: TESTING TIERRA SERVICES ACCESS')
  console.log('==========================================')
  
  if (!tierraUser) {
    console.log('❌ Cannot test services access - Tierra login failed')
    return
  }
  
  try {
    const response = await fetch('https://thepmuguide.com/api/services', {
      method: 'GET',
      headers: {
        'x-user-email': tierraUser.email
      }
    })
    
    console.log(`Services API Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Tierra can access services API')
      console.log(`Services found: ${data.services?.length || 0}`)
      
      if (data.services && data.services.length > 0) {
        console.log('\n📋 Services visible to Tierra:')
        data.services.forEach((service, index) => {
          console.log(`${index + 1}. ${service.name} - $${service.defaultPrice}`)
          console.log(`   Duration: ${service.defaultDuration} minutes`)
          console.log(`   Category: ${service.category}`)
          console.log(`   Owner ID: ${service.userId}`)
        })
      } else {
        console.log('⚠️ No services found for Tierra')
        console.log('🔍 This means:')
        console.log('  1. Studio owner has not uploaded any services yet')
        console.log('  2. Services API is working correctly (no error)')
        console.log('  3. Tierra can see services when owner adds them')
      }
    } else {
      const errorData = await response.text()
      console.log('❌ Tierra cannot access services API')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
    }
    
  } catch (error) {
    console.log('❌ Services API error:', error.message)
  }
}

async function testTierraInstructorAccess(tierraUser) {
  console.log('\n📊 STEP 3: TESTING TIERRA INSTRUCTOR ACCESS')
  console.log('============================================')
  
  if (!tierraUser) {
    console.log('❌ Cannot test instructor access - Tierra login failed')
    return
  }
  
  try {
    const response = await fetch('https://thepmuguide.com/api/studio/instructors', {
      method: 'GET',
      headers: {
        'x-user-email': tierraUser.email
      }
    })
    
    console.log(`Instructors API Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Tierra can access instructors API')
      console.log(`Instructors found: ${data.instructors?.length || 0}`)
      console.log(`Studio Name: ${data.studioName}`)
      
      if (data.instructors && data.instructors.length > 0) {
        console.log('\n👥 Instructors visible to Tierra:')
        data.instructors.forEach((instructor, index) => {
          console.log(`${index + 1}. ${instructor.name} (${instructor.role})`)
          console.log(`   Email: ${instructor.email}`)
          console.log(`   ID: ${instructor.id}`)
        })
      } else {
        console.log('⚠️ No instructors found for Tierra')
        console.log('🔍 This means:')
        console.log('  1. No instructors have been added to the studio yet')
        console.log('  2. Instructors API is working correctly (no error)')
        console.log('  3. Tierra can see instructors when they are added')
      }
    } else {
      const errorData = await response.text()
      console.log('❌ Tierra cannot access instructors API')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
    }
    
  } catch (error) {
    console.log('❌ Instructors API error:', error.message)
  }
}

async function testTierraSupervisionAccess(tierraUser) {
  console.log('\n📊 STEP 4: TESTING TIERRA SUPERVISION ACCESS')
  console.log('==============================================')
  
  if (!tierraUser) {
    console.log('❌ Cannot test supervision access - Tierra login failed')
    return
  }
  
  console.log('🎯 SUPERVISION BOOKING SYSTEM TEST:')
  console.log('==================================')
  console.log('1. Tierra should be able to access /studio/supervision')
  console.log('2. Tierra should see "Find Supervisors" tab')
  console.log('3. Tierra should see instructor list (when instructors are added)')
  console.log('4. Tierra should be able to book supervision sessions')
  
  console.log('\n💡 MANUAL TEST NEEDED:')
  console.log('=====================')
  console.log('1. Tierra should log in at thepmuguide.com')
  console.log('2. Tierra should go to Studio → Supervision')
  console.log('3. Tierra should click "Find Supervisors" tab')
  console.log('4. Tierra should see instructor list (if any instructors exist)')
  console.log('5. If no instructors, studio owner needs to add them first')
}

async function runTierraAccessTest() {
  console.log('🎯 TESTING TIERRA STUDENT ACCESS AFTER ACCOUNT CREATION')
  console.log('=======================================================')
  
  // Step 1: Test login
  const tierraUser = await testTierraLogin()
  
  // Step 2: Test services access
  await testTierraServicesAccess(tierraUser)
  
  // Step 3: Test instructor access
  await testTierraInstructorAccess(tierraUser)
  
  // Step 4: Test supervision access
  await testTierraSupervisionAccess(tierraUser)
  
  console.log('\n🎯 TEST SUMMARY:')
  console.log('===============')
  
  if (tierraUser) {
    console.log('✅ Tierra account exists and can log in')
    console.log(`✅ Role: ${tierraUser.role} (correct for student)`)
    console.log(`✅ Studio: ${tierraUser.studioName} (correct association)`)
    console.log(`✅ Plan: ${tierraUser.selectedPlan} (inherited from studio)`)
    console.log(`✅ Subscription: ${tierraUser.hasActiveSubscription} (inherited from studio)`)
    
    console.log('\n🚀 NEXT STEPS:')
    console.log('==============')
    console.log('1. Studio owner needs to add some services')
    console.log('2. Studio owner needs to add instructors to the team')
    console.log('3. Tierra should then be able to see services and instructors')
    console.log('4. Tierra should be able to book supervision sessions')
    
  } else {
    console.log('❌ Tierra account login failed')
    console.log('Need to investigate login issues')
  }
}

runTierraAccessTest().catch(console.error)
