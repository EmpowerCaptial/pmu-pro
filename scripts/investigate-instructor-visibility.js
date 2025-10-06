#!/usr/bin/env node

/**
 * Investigate why Tierra student can't see instructor tierra.cochrane51@gmail.com
 */

console.log('🔍 INVESTIGATING INSTRUCTOR VISIBILITY ISSUE')
console.log('============================================')

async function checkTyroneAccount() {
  console.log('\n👑 STEP 1: CHECKING TYRONE OWNER ACCOUNT')
  console.log('=========================================')
  
  try {
    const response = await fetch('https://thepmuguide.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'tyronejackboy@gmail.com',
        password: 'Tyronej22!'
      })
    })
    
    console.log(`Tyrone Login Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Tyrone login successful!')
      console.log('\n👑 TYRONE ACCOUNT DETAILS:')
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
      console.log('❌ Tyrone login failed')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
      return null
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message)
    return null
  }
}

async function checkTierraStudentAccount() {
  console.log('\n👨‍🎓 STEP 2: CHECKING TIERRA STUDENT ACCOUNT')
  console.log('============================================')
  
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
    
    console.log(`Tierra Login Response Status: ${response.status}`)
    
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

async function checkInstructorAccount() {
  console.log('\n👩‍🏫 STEP 3: CHECKING INSTRUCTOR ACCOUNT')
  console.log('======================================')
  
  try {
    const response = await fetch('https://thepmuguide.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'tierra.cochrane51@gmail.com',
        password: 'testing' // Assuming same password
      })
    })
    
    console.log(`Instructor Login Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Instructor login successful!')
      console.log('\n👩‍🏫 INSTRUCTOR ACCOUNT DETAILS:')
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
      console.log('❌ Instructor login failed')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
      console.log('🔍 This suggests the instructor account might not exist or has different credentials')
      return null
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message)
    return null
  }
}

async function testTyroneInstructorAccess(tyroneUser) {
  console.log('\n📊 STEP 4: TESTING TYRONE INSTRUCTOR ACCESS')
  console.log('============================================')
  
  if (!tyroneUser) {
    console.log('❌ Cannot test instructor access - Tyrone login failed')
    return
  }
  
  try {
    const response = await fetch('https://thepmuguide.com/api/studio/instructors', {
      method: 'GET',
      headers: {
        'x-user-email': tyroneUser.email
      }
    })
    
    console.log(`Tyrone Instructors API Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Tyrone can access instructors API')
      console.log(`Instructors found: ${data.instructors?.length || 0}`)
      console.log(`Studio Name: ${data.studioName}`)
      
      if (data.instructors && data.instructors.length > 0) {
        console.log('\n👥 Instructors visible to Tyrone:')
        data.instructors.forEach((instructor, index) => {
          console.log(`${index + 1}. ${instructor.name} (${instructor.role})`)
          console.log(`   Email: ${instructor.email}`)
          console.log(`   ID: ${instructor.id}`)
          console.log(`   Studio: ${instructor.studioName || 'N/A'}`)
        })
      } else {
        console.log('⚠️ No instructors found for Tyrone')
      }
    } else {
      const errorData = await response.text()
      console.log('❌ Tyrone cannot access instructors API')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
    }
    
  } catch (error) {
    console.log('❌ Instructors API error:', error.message)
  }
}

async function testTierraInstructorAccess(tierraUser) {
  console.log('\n📊 STEP 5: TESTING TIERRA INSTRUCTOR ACCESS')
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
    
    console.log(`Tierra Instructors API Response Status: ${response.status}`)
    
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
          console.log(`   Studio: ${instructor.studioName || 'N/A'}`)
        })
      } else {
        console.log('⚠️ No instructors found for Tierra')
        console.log('🔍 This is the problem! Tierra should see the same instructors as Tyrone')
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

async function analyzeStudioNameMismatch(tyroneUser, tierraUser) {
  console.log('\n🔍 STEP 6: ANALYZING STUDIO NAME MISMATCH')
  console.log('==========================================')
  
  if (!tyroneUser || !tierraUser) {
    console.log('❌ Cannot analyze - missing user data')
    return
  }
  
  console.log('📊 STUDIO NAME COMPARISON:')
  console.log(`Tyrone Studio Name: "${tyroneUser.studioName}"`)
  console.log(`Tierra Studio Name: "${tierraUser.studioName}"`)
  
  if (tyroneUser.studioName === tierraUser.studioName) {
    console.log('✅ Studio names match')
  } else {
    console.log('❌ Studio names do not match!')
    console.log('🔍 This is likely why Tierra cannot see instructors')
    console.log('💡 The instructors API filters by studio name')
  }
  
  console.log('\n📊 BUSINESS NAME COMPARISON:')
  console.log(`Tyrone Business Name: "${tyroneUser.businessName}"`)
  console.log(`Tierra Business Name: "${tierraUser.businessName}"`)
  
  if (tyroneUser.businessName === tierraUser.businessName) {
    console.log('✅ Business names match')
  } else {
    console.log('❌ Business names do not match!')
  }
}

async function runInstructorInvestigation() {
  console.log('🎯 INVESTIGATING INSTRUCTOR VISIBILITY ISSUE')
  console.log('============================================')
  
  // Step 1: Check Tyrone account
  const tyroneUser = await checkTyroneAccount()
  
  // Step 2: Check Tierra student account
  const tierraUser = await checkTierraStudentAccount()
  
  // Step 3: Check instructor account
  const instructorUser = await checkInstructorAccount()
  
  // Step 4: Test Tyrone instructor access
  await testTyroneInstructorAccess(tyroneUser)
  
  // Step 5: Test Tierra instructor access
  await testTierraInstructorAccess(tierraUser)
  
  // Step 6: Analyze studio name mismatch
  await analyzeStudioNameMismatch(tyroneUser, tierraUser)
  
  console.log('\n🎯 INVESTIGATION SUMMARY:')
  console.log('========================')
  console.log(`Tyrone Account: ${tyroneUser ? '✅ Exists' : '❌ Missing'}`)
  console.log(`Tierra Student Account: ${tierraUser ? '✅ Exists' : '❌ Missing'}`)
  console.log(`Instructor Account: ${instructorUser ? '✅ Exists' : '❌ Missing'}`)
  
  if (tyroneUser && tierraUser) {
    console.log('\n🔍 LIKELY ISSUES:')
    console.log('================')
    console.log('1. Studio name mismatch between Tyrone and Tierra')
    console.log('2. Instructor account might not exist or have wrong credentials')
    console.log('3. Instructor might not be properly associated with the studio')
    console.log('4. localStorage sync issue between team page and supervision page')
    
    console.log('\n🚀 RECOMMENDED FIXES:')
    console.log('====================')
    console.log('1. Ensure Tierra has the same studioName as Tyrone')
    console.log('2. Verify instructor account exists and is properly associated')
    console.log('3. Check localStorage sync on supervision page')
    console.log('4. Test instructor visibility after fixes')
  }
}

runInstructorInvestigation().catch(console.error)
