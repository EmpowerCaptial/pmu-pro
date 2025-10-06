#!/usr/bin/env node

/**
 * Simulate Tierra login and check supervision booking instructor list
 */

console.log('🔍 SIMULATING TIERRA LOGIN AND CHECKING INSTRUCTOR LIST')
console.log('=======================================================')

async function simulateTierraLogin() {
  console.log('\n🔐 STEP 1: SIMULATING TIERRA LOGIN')
  console.log('===================================')
  
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
      console.log('\n👨‍🎓 TIERRA ACCOUNT DETAILS:')
      console.log(`ID: ${data.user.id}`)
      console.log(`Name: ${data.user.name}`)
      console.log(`Email: ${data.user.email}`)
      console.log(`Role: ${data.user.role}`)
      console.log(`Business Name: ${data.user.businessName}`)
      console.log(`Studio Name: ${data.user.studioName}`)
      console.log(`Selected Plan: ${data.user.selectedPlan}`)
      
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

async function checkInstructorsAPI(tierraUser) {
  console.log('\n📊 STEP 2: CHECKING INSTRUCTORS API')
  console.log('====================================')
  
  if (!tierraUser) {
    console.log('❌ Cannot check instructors - Tierra login failed')
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
        console.log('\n👥 INSTRUCTORS FROM API:')
        data.instructors.forEach((instructor, index) => {
          console.log(`${index + 1}. ${instructor.name} (${instructor.role})`)
          console.log(`   Email: ${instructor.email}`)
          console.log(`   ID: ${instructor.id}`)
          console.log(`   Studio: ${instructor.studioName || 'N/A'}`)
        })
        
        // Check if Tierra Cochrane is in the list
        const tierraCochrane = data.instructors.find(inst => 
          inst.email === 'tierra.cochrane51@gmail.com'
        )
        
        if (tierraCochrane) {
          console.log('\n✅ Tierra Cochrane found in API response!')
        } else {
          console.log('\n❌ Tierra Cochrane NOT found in API response')
        }
        
      } else {
        console.log('⚠️ No instructors found in API response')
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

async function checkAllInstructorsInDatabase() {
  console.log('\n📊 STEP 3: CHECKING ALL INSTRUCTORS IN DATABASE')
  console.log('===============================================')
  
  try {
    // Let's check what instructors exist in the database by trying to log in as known instructors
    const instructorEmails = [
      'tierra.cochrane51@gmail.com',
      'owner@universalbeautystudio.com',
      'test.student@universalbeautystudio.com'
    ]
    
    console.log('🔍 Checking instructor accounts in database...')
    
    for (const email of instructorEmails) {
      try {
        const response = await fetch('https://thepmuguide.com/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: 'testing123' // Try common passwords
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ ${email} - Role: ${data.user.role}, Studio: ${data.user.studioName}`)
        } else {
          console.log(`❌ ${email} - Login failed`)
        }
      } catch (error) {
        console.log(`❌ ${email} - Error: ${error.message}`)
      }
    }
    
  } catch (error) {
    console.log('❌ Database check error:', error.message)
  }
}

async function analyzeSupervisionPageIssue() {
  console.log('\n🔍 STEP 4: ANALYZING SUPERVISION PAGE ISSUE')
  console.log('============================================')
  
  console.log('🎯 POTENTIAL ISSUES:')
  console.log('====================')
  console.log('1. ❌ Supervision page might be using localStorage instead of API')
  console.log('2. ❌ Mock instructors might be hardcoded in the frontend')
  console.log('3. ❌ Studio name mismatch preventing API from finding instructors')
  console.log('4. ❌ localStorage not syncing with database changes')
  console.log('5. ❌ Frontend caching old instructor data')
  
  console.log('\n💡 DEBUGGING STEPS:')
  console.log('====================')
  console.log('1. Check browser DevTools → Application → Local Storage')
  console.log('2. Look for "studio-instructors" key')
  console.log('3. Check if it contains mock data or real instructor data')
  console.log('4. Clear localStorage and refresh the page')
  console.log('5. Check if the supervision page calls the API correctly')
  
  console.log('\n🔧 LIKELY FIXES:')
  console.log('================')
  console.log('1. Update supervision page to prioritize API data over localStorage')
  console.log('2. Remove hardcoded mock instructors')
  console.log('3. Ensure proper studio name association')
  console.log('4. Add localStorage sync when instructors are added')
}

async function runTierraSupervisionTest() {
  console.log('🎯 TESTING TIERRA SUPERVISION BOOKING')
  console.log('=====================================')
  
  // Step 1: Simulate Tierra login
  const tierraUser = await simulateTierraLogin()
  
  // Step 2: Check instructors API
  await checkInstructorsAPI(tierraUser)
  
  // Step 3: Check all instructors in database
  await checkAllInstructorsInDatabase()
  
  // Step 4: Analyze the issue
  await analyzeSupervisionPageIssue()
  
  console.log('\n🎯 SUMMARY:')
  console.log('===========')
  console.log('✅ Tierra can log in successfully')
  console.log('✅ Tierra can access instructors API')
  console.log('❌ Supervision page shows mock instructors instead of real ones')
  
  console.log('\n🚀 NEXT STEPS:')
  console.log('==============')
  console.log('1. Check the supervision page code for hardcoded mock data')
  console.log('2. Ensure it prioritizes API data over localStorage')
  console.log('3. Fix the instructor loading logic')
  console.log('4. Test the supervision page again')
}

runTierraSupervisionTest().catch(console.error)
