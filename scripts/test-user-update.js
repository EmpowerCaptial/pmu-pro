#!/usr/bin/env node

/**
 * Test user update API to see if it's working
 */

async function testUserUpdate() {
  console.log('🧪 Testing user update API...')
  
  try {
    // First, get all users to find the instructor
    const usersResponse = await fetch('https://thepmuguide.com/api/admin/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!usersResponse.ok) {
      throw new Error('Failed to fetch users')
    }

    const usersData = await usersResponse.json()
    console.log('📊 Found users:', usersData.data?.length || 0)
    
    // Find the instructor user
    const instructorUser = usersData.data?.find(user => 
      user.email === 'admin@universalbeautystudio.com'
    )
    
    if (!instructorUser) {
      console.log('❌ Instructor user not found')
      console.log('Available users:')
      usersData.data?.forEach(user => {
        console.log(`  - ${user.email} (${user.name}) - Status: ${user.subscriptionStatus} - License: ${user.isLicenseVerified}`)
      })
      return
    }
    
    console.log('✅ Found instructor user:')
    console.log('   Email:', instructorUser.email)
    console.log('   ID:', instructorUser.id)
    console.log('   Current Status:', instructorUser.subscriptionStatus)
    console.log('   Current License Verified:', instructorUser.isLicenseVerified)
    console.log('   Has Active Subscription:', instructorUser.hasActiveSubscription)
    
    // Test the update API
    console.log('\n🔄 Testing update API...')
    const updateResponse = await fetch('https://thepmuguide.com/api/admin/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: instructorUser.id,
        updates: {
          subscriptionStatus: 'approved',
          hasActiveSubscription: true,
          isLicenseVerified: true
        }
      })
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json()
      console.error('❌ Update failed:', errorData)
      return
    }

    const updateData = await updateResponse.json()
    console.log('✅ Update successful!')
    console.log('📊 Updated User Data:')
    console.log('   Email:', updateData.data.email)
    console.log('   Status:', updateData.data.subscriptionStatus)
    console.log('   License Verified:', updateData.data.isLicenseVerified)
    console.log('   Has Active Subscription:', updateData.data.hasActiveSubscription)
    
    // Verify the update by fetching the user again
    console.log('\n🔍 Verifying update...')
    const verifyResponse = await fetch('https://thepmuguide.com/api/admin/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json()
      const updatedUser = verifyData.data?.find(user => 
        user.email === 'admin@universalbeautystudio.com'
      )
      
      if (updatedUser) {
        console.log('✅ Verification successful!')
        console.log('📊 Current User Data:')
        console.log('   Status:', updatedUser.subscriptionStatus)
        console.log('   License Verified:', updatedUser.isLicenseVerified)
        console.log('   Has Active Subscription:', updatedUser.hasActiveSubscription)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run the test
testUserUpdate()
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
