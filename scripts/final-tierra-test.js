#!/usr/bin/env node

/**
 * Fix Tierra's studio name and test the complete system
 */

console.log('🔧 FIXING TIERRA STUDIO NAME AND TESTING COMPLETE SYSTEM')
console.log('=========================================================')

async function fixTierraStudioName() {
  console.log('\n🔧 STEP 1: FIXING TIERRA STUDIO NAME')
  console.log('=====================================')
  
  try {
    const response = await fetch('https://thepmuguide.com/api/fix-studio-name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'tierra@universalbeautystudio.com',
        studioName: 'Universal Beauty Studio'
      })
    })
    
    console.log(`Fix Studio Name Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Tierra\'s studio name fixed successfully!')
      console.log('\n👤 UPDATED TIERRA ACCOUNT:')
      console.log(`ID: ${data.user.id}`)
      console.log(`Name: ${data.user.name}`)
      console.log(`Email: ${data.user.email}`)
      console.log(`Role: ${data.user.role}`)
      console.log(`Business Name: ${data.user.businessName}`)
      console.log(`Studio Name: ${data.user.studioName}`)
      console.log(`Plan: ${data.user.selectedPlan}`)
      console.log(`Has Active Subscription: ${data.user.hasActiveSubscription}`)
      
      return true
    } else {
      const errorData = await response.text()
      console.log('❌ Failed to fix Tierra\'s studio name:')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
      return false
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message)
    return false
  }
}

async function createStudioOwnerAndServices() {
  console.log('\n📊 STEP 2: CREATING STUDIO OWNER AND SERVICES')
  console.log('==============================================')
  
  try {
    // Create studio owner using the team invitation API
    const ownerInvitationData = {
      memberEmail: 'owner@universalbeautystudio.com',
      memberName: 'Studio Owner',
      memberPassword: 'owner123',
      memberRole: 'owner',
      studioName: 'Universal Beauty Studio',
      studioOwnerName: 'Studio Owner'
    }
    
    console.log('🚀 Creating studio owner via team invitation...')
    
    const ownerResponse = await fetch('https://thepmuguide.com/api/studio/invite-team-member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ownerInvitationData)
    })
    
    console.log(`Owner Creation Response Status: ${ownerResponse.status}`)
    
    if (ownerResponse.ok) {
      const ownerData = await ownerResponse.json()
      console.log('✅ Studio owner created successfully!')
      console.log(`Owner ID: ${ownerData.userId}`)
      
      // Wait a moment for the account to be fully created
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Now create some test services
      console.log('\n🚀 Creating test services...')
      
      const services = [
        {
          name: 'Eyebrow Microblading',
          description: 'Semi-permanent eyebrow tattooing',
          defaultPrice: 300,
          defaultDuration: 120,
          category: 'Eyebrows'
        },
        {
          name: 'Lip Blushing',
          description: 'Semi-permanent lip color',
          defaultPrice: 400,
          defaultDuration: 90,
          category: 'Lips'
        },
        {
          name: 'Eyeliner Tattoo',
          description: 'Semi-permanent eyeliner',
          defaultPrice: 350,
          defaultDuration: 60,
          category: 'Eyes'
        }
      ]
      
      for (const service of services) {
        try {
          const serviceResponse = await fetch('https://thepmuguide.com/api/services', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-email': 'owner@universalbeautystudio.com'
            },
            body: JSON.stringify(service)
          })
          
          if (serviceResponse.ok) {
            console.log(`✅ Created service: ${service.name}`)
          } else {
            const errorData = await serviceResponse.text()
            console.log(`❌ Failed to create service: ${service.name}`)
            console.log(`Error: ${errorData}`)
          }
        } catch (error) {
          console.log(`❌ Error creating service ${service.name}:`, error.message)
        }
      }
      
      return true
      
    } else {
      const errorData = await ownerResponse.text()
      console.log('❌ Failed to create studio owner:')
      console.log(`Status: ${ownerResponse.status}`)
      console.log(`Error: ${errorData}`)
      return false
    }
    
  } catch (error) {
    console.log('❌ Error creating studio owner and services:', error.message)
    return false
  }
}

async function testTierraServicesAccess() {
  console.log('\n📊 STEP 3: TESTING TIERRA SERVICES ACCESS')
  console.log('==========================================')
  
  try {
    const response = await fetch('https://thepmuguide.com/api/services', {
      method: 'GET',
      headers: {
        'x-user-email': 'tierra@universalbeautystudio.com'
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
        })
        
        console.log('\n🎉 SUCCESS! Tierra can now see studio services!')
        return true
      } else {
        console.log('⚠️ Still no services visible to Tierra')
        console.log('🔍 This suggests the studio name association is still not working')
        return false
      }
    } else {
      const errorData = await response.text()
      console.log('❌ Tierra cannot access services API')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
      return false
    }
    
  } catch (error) {
    console.log('❌ Services API error:', error.message)
    return false
  }
}

async function testTierraInstructorAccess() {
  console.log('\n📊 STEP 4: TESTING TIERRA INSTRUCTOR ACCESS')
  console.log('============================================')
  
  try {
    const response = await fetch('https://thepmuguide.com/api/studio/instructors', {
      method: 'GET',
      headers: {
        'x-user-email': 'tierra@universalbeautystudio.com'
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
        })
        
        console.log('\n🎉 SUCCESS! Tierra can now see studio instructors!')
        return true
      } else {
        console.log('⚠️ No instructors found for Tierra')
        console.log('🔍 Studio owner needs to add instructors to the team')
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

async function runCompleteSystemTest() {
  console.log('🎯 COMPLETE SYSTEM TEST FOR TIERRA')
  console.log('==================================')
  
  // Step 1: Fix Tierra's studio name
  const studioNameFixed = await fixTierraStudioName()
  
  // Step 2: Create studio owner and services
  const ownerCreated = await createStudioOwnerAndServices()
  
  // Step 3: Test Tierra's services access
  const servicesWorking = await testTierraServicesAccess()
  
  // Step 4: Test Tierra's instructor access
  const instructorsWorking = await testTierraInstructorAccess()
  
  console.log('\n🎯 FINAL SYSTEM TEST RESULTS:')
  console.log('=============================')
  console.log(`✅ Studio Name Fixed: ${studioNameFixed ? 'YES' : 'NO'}`)
  console.log(`✅ Studio Owner Created: ${ownerCreated ? 'YES' : 'NO'}`)
  console.log(`✅ Services Access Working: ${servicesWorking ? 'YES' : 'NO'}`)
  console.log(`✅ Instructors Access Working: ${instructorsWorking ? 'YES' : 'NO'}`)
  
  if (studioNameFixed && servicesWorking) {
    console.log('\n🎉 SUCCESS! TIERRA\'S SYSTEM IS NOW WORKING!')
    console.log('\n🚀 WHAT TIERRA CAN NOW DO:')
    console.log('=========================')
    console.log('1. ✅ Log in with tierra@universalbeautystudio.com / testing')
    console.log('2. ✅ View services uploaded by studio owner')
    console.log('3. ✅ Access instructor booking system')
    console.log('4. ✅ Book supervision sessions (when instructors are added)')
    console.log('5. ✅ Use the complete student workflow')
    
    console.log('\n📋 NEXT STEPS FOR STUDIO OWNER:')
    console.log('==============================')
    console.log('1. Log in as owner@universalbeautystudio.com / owner123')
    console.log('2. Go to Studio → Team and add instructors')
    console.log('3. Instructors will then be visible to Tierra')
    console.log('4. Tierra can book supervision sessions with instructors')
    
  } else {
    console.log('\n❌ SYSTEM STILL HAS ISSUES')
    console.log('Need to investigate further')
  }
}

runCompleteSystemTest().catch(console.error)
