#!/usr/bin/env node

/**
 * Create the instructor account properly using the team invitation API
 */

console.log('🔧 CREATING INSTRUCTOR ACCOUNT PROPERLY')
console.log('=======================================')

async function createInstructorAccount() {
  console.log('\n👩‍🏫 CREATING INSTRUCTOR ACCOUNT')
  console.log('================================')
  
  const instructorData = {
    memberEmail: 'tierra.cochrane51@gmail.com',
    memberName: 'Tierra Cochrane',
    memberPassword: 'testing123',
    memberRole: 'instructor',
    studioName: 'Universal Beauty Studio',
    studioOwnerName: 'Tyrone Jackson'
  }
  
  console.log('📋 Instructor Data:')
  console.log(`Name: ${instructorData.memberName}`)
  console.log(`Email: ${instructorData.memberEmail}`)
  console.log(`Role: ${instructorData.memberRole}`)
  console.log(`Studio: ${instructorData.studioName}`)
  console.log(`Password: ${instructorData.memberPassword}`)
  
  try {
    console.log('\n🚀 Creating instructor account via team invitation...')
    
    const response = await fetch('https://thepmuguide.com/api/studio/invite-team-member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(instructorData)
    })
    
    console.log(`Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Instructor account created successfully!')
      console.log('Response:', data)
      
      if (data.userId) {
        console.log('\n👩‍🏫 Created Instructor:')
        console.log(`ID: ${data.userId}`)
        console.log(`Name: ${instructorData.memberName}`)
        console.log(`Email: ${instructorData.memberEmail}`)
        console.log(`Role: ${instructorData.memberRole}`)
        console.log(`Studio: ${instructorData.studioName}`)
      }
      
      return true
      
    } else {
      const errorData = await response.text()
      console.log('❌ Failed to create instructor account:')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
      return false
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message)
    return false
  }
}

async function testInstructorLogin() {
  console.log('\n🧪 TESTING INSTRUCTOR LOGIN')
  console.log('============================')
  
  try {
    const response = await fetch('https://thepmuguide.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'tierra.cochrane51@gmail.com',
        password: 'testing123'
      })
    })
    
    console.log(`Login Response Status: ${response.status}`)
    
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
      console.log(`Has Active Subscription: ${data.user.hasActiveSubscription}`)
      console.log(`Is License Verified: ${data.user.isLicenseVerified}`)
      
      return data.user
    } else {
      const errorData = await response.text()
      console.log('❌ Instructor login failed')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
      return null
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message)
    return null
  }
}

async function testTierraCanSeeInstructor() {
  console.log('\n📊 TESTING IF TIERRA CAN SEE INSTRUCTOR')
  console.log('=======================================')
  
  try {
    const response = await fetch('https://thepmuguide.com/api/studio/instructors', {
      method: 'GET',
      headers: {
        'x-user-email': 'tierra@universalbeautystudio.com'
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
        
        // Check if Tierra Cochrane is in the list
        const tierraCochrane = data.instructors.find(inst => 
          inst.email === 'tierra.cochrane51@gmail.com'
        )
        
        if (tierraCochrane) {
          console.log('\n🎉 SUCCESS! Tierra can now see Tierra Cochrane as an instructor!')
          return true
        } else {
          console.log('\n⚠️ Tierra Cochrane not found in instructor list')
          return false
        }
        
      } else {
        console.log('⚠️ No instructors found for Tierra')
        return false
      }
    } else {
      const errorData = await response.text()
      console.log('❌ Tierra cannot access instructors API')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
      return false
    }
    
  } catch (error) {
    console.log('❌ Instructors API error:', error.message)
    return false
  }
}

async function runInstructorCreation() {
  console.log('🎯 CREATING INSTRUCTOR ACCOUNT PROPERLY')
  console.log('=======================================')
  
  // Step 1: Create instructor account
  const instructorCreated = await createInstructorAccount()
  
  // Step 2: Test instructor login
  const instructorLogin = await testInstructorLogin()
  
  // Step 3: Test if Tierra can see instructor
  const tierraCanSee = await testTierraCanSeeInstructor()
  
  console.log('\n🎯 FINAL RESULTS:')
  console.log('================')
  console.log(`✅ Instructor Account Created: ${instructorCreated ? 'YES' : 'NO'}`)
  console.log(`✅ Instructor Can Login: ${instructorLogin ? 'YES' : 'NO'}`)
  console.log(`✅ Tierra Can See Instructor: ${tierraCanSee ? 'YES' : 'NO'}`)
  
  if (instructorCreated && instructorLogin && tierraCanSee) {
    console.log('\n🎉 COMPLETE SUCCESS!')
    console.log('\n🚀 WHAT WORKS NOW:')
    console.log('=================')
    console.log('1. ✅ Tierra Cochrane instructor account exists in database')
    console.log('2. ✅ Tierra Cochrane can log in with tierra.cochrane51@gmail.com / testing123')
    console.log('3. ✅ Tierra student can see Tierra Cochrane instructor')
    console.log('4. ✅ Instructor booking system should now work')
    console.log('5. ✅ Tierra student can book supervision sessions with Tierra Cochrane')
    
    console.log('\n📋 NEXT STEPS:')
    console.log('==============')
    console.log('1. Tierra student logs in at thepmuguide.com')
    console.log('2. Goes to Studio → Supervision')
    console.log('3. Clicks "Find Supervisors" tab')
    console.log('4. Should now see Tierra Cochrane as an instructor option')
    console.log('5. Can book supervision sessions!')
    
  } else {
    console.log('\n❌ SOME ISSUES REMAIN')
    console.log('Need to investigate further')
  }
}

runInstructorCreation().catch(console.error)
