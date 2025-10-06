#!/usr/bin/env node

/**
 * Create proper Tierra student account with correct studio association
 */

console.log('🔧 CREATING PROPER TIERRA STUDENT ACCOUNT')
console.log('==========================================')

async function createTierraStudentAccount() {
  console.log('\n👨‍🎓 CREATING TIERRA STUDENT ACCOUNT')
  console.log('===================================')
  
  const invitationData = {
    memberEmail: 'tierra@universalbeautystudio.com',
    memberName: 'Ty',
    memberPassword: 'testing',
    memberRole: 'student',
    studioName: 'Universal Beauty Studio',
    studioOwnerName: 'Tyrone Jackson'
  }
  
  console.log('📋 Tierra Student Invitation Data:')
  console.log(`Name: ${invitationData.memberName}`)
  console.log(`Email: ${invitationData.memberEmail}`)
  console.log(`Role: ${invitationData.memberRole}`)
  console.log(`Studio: ${invitationData.studioName}`)
  console.log(`Owner: ${invitationData.studioOwnerName}`)
  
  try {
    console.log('\n🚀 Creating Tierra student account via team invitation...')
    
    const response = await fetch('https://thepmuguide.com/api/studio/invite-team-member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invitationData)
    })
    
    console.log(`Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Tierra student account created successfully!')
      console.log('Response:', data)
      
      if (data.userId) {
        console.log('\n👤 Created Tierra User:')
        console.log(`ID: ${data.userId}`)
        console.log(`Name: ${invitationData.memberName}`)
        console.log(`Email: ${invitationData.memberEmail}`)
        console.log(`Role: ${invitationData.memberRole}`)
        console.log(`Studio: ${invitationData.studioName}`)
      }
      
      return true
      
    } else {
      const errorData = await response.text()
      console.log('❌ Failed to create Tierra student account:')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
      return false
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message)
    return false
  }
}

async function createTyroneOwnerAccount() {
  console.log('\n👑 CREATING TYRONE OWNER ACCOUNT')
  console.log('================================')
  
  const tyroneData = {
    name: 'Tyrone Jackson',
    email: 'tyronejackboy@gmail.com',
    password: 'Tyronej22!',
    role: 'owner',
    businessName: 'Universal Beauty Studio',
    studioName: 'Universal Beauty Studio',
    selectedPlan: 'studio',
    hasActiveSubscription: true,
    isLicenseVerified: true
  }
  
  console.log('📋 Tyrone Owner Data:')
  console.log(`Name: ${tyroneData.name}`)
  console.log(`Email: ${tyroneData.email}`)
  console.log(`Role: ${tyroneData.role}`)
  console.log(`Studio: ${tyroneData.studioName}`)
  console.log(`Plan: ${tyroneData.selectedPlan}`)
  console.log(`Has Active Subscription: ${tyroneData.hasActiveSubscription}`)
  
  try {
    console.log('\n🚀 Creating Tyrone owner account...')
    
    const response = await fetch('https://thepmuguide.com/api/create-user-general', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tyroneData)
    })
    
    console.log(`Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Tyrone owner account created successfully!')
      console.log('Response:', data)
      
      if (data.user) {
        console.log('\n👑 Created Tyrone User:')
        console.log(`ID: ${data.user.id}`)
        console.log(`Name: ${data.user.name}`)
        console.log(`Email: ${data.user.email}`)
        console.log(`Role: ${data.user.role}`)
        console.log(`Studio: ${data.user.studioName}`)
        console.log(`Plan: ${data.user.selectedPlan}`)
      }
      
      return true
      
    } else {
      const errorData = await response.text()
      console.log('❌ Failed to create Tyrone owner account:')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
      return false
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message)
    return false
  }
}

async function testAccountLogin() {
  console.log('\n🧪 TESTING ACCOUNT LOGIN')
  console.log('========================')
  
  // Test Tierra login
  console.log('\n🎓 Testing Tierra login...')
  try {
    const tierraResponse = await fetch('https://thepmuguide.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'tierra@universalbeautystudio.com',
        password: 'testing'
      })
    })
    
    if (tierraResponse.ok) {
      const tierraData = await tierraResponse.json()
      console.log('✅ Tierra login successful!')
      console.log(`Role: ${tierraData.user.role}`)
      console.log(`Studio: ${tierraData.user.studioName}`)
    } else {
      console.log('❌ Tierra login failed')
    }
  } catch (error) {
    console.log('❌ Tierra login error:', error.message)
  }
  
  // Test Tyrone login
  console.log('\n👑 Testing Tyrone login...')
  try {
    const tyroneResponse = await fetch('https://thepmuguide.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'tyronejackboy@gmail.com',
        password: 'Tyronej22!'
      })
    })
    
    if (tyroneResponse.ok) {
      const tyroneData = await tyroneResponse.json()
      console.log('✅ Tyrone login successful!')
      console.log(`Role: ${tyroneData.user.role}`)
      console.log(`Studio: ${tyroneData.user.studioName}`)
    } else {
      console.log('❌ Tyrone login failed')
    }
  } catch (error) {
    console.log('❌ Tyrone login error:', error.message)
  }
}

async function runAccountCreation() {
  console.log('🎯 CREATING PROPER STUDENT AND OWNER ACCOUNTS')
  console.log('=============================================')
  
  // Create Tyrone owner account first
  const tyroneCreated = await createTyroneOwnerAccount()
  
  // Create Tierra student account
  const tierraCreated = await createTierraStudentAccount()
  
  // Test login
  if (tyroneCreated && tierraCreated) {
    await testAccountLogin()
  }
  
  console.log('\n🎯 ACCOUNT CREATION SUMMARY:')
  console.log('============================')
  console.log(`Tyrone Owner Account: ${tyroneCreated ? '✅ Created' : '❌ Failed'}`)
  console.log(`Tierra Student Account: ${tierraCreated ? '✅ Created' : '❌ Failed'}`)
  
  if (tyroneCreated && tierraCreated) {
    console.log('\n✅ BOTH ACCOUNTS CREATED SUCCESSFULLY!')
    console.log('\n🚀 NEXT STEPS:')
    console.log('==============')
    console.log('1. Tyrone (owner) should log in and add some services')
    console.log('2. Tyrone should go to Studio → Team and add Tierra as student')
    console.log('3. Tierra should log in and test services page')
    console.log('4. Tierra should test instructor booking page')
    console.log('5. Both should work correctly now!')
  } else {
    console.log('\n❌ ACCOUNT CREATION FAILED')
    console.log('Need to investigate API issues or database problems')
  }
}

runAccountCreation().catch(console.error)
