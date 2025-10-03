#!/usr/bin/env node

/**
 * Approve instructor account through admin API
 * This will set isLicenseVerified: true for the instructor account
 */

async function approveInstructor() {
  console.log('🔧 Approving instructor account...')
  
  try {
    // First, we need to get the user ID
    // Let's call the admin users API to find the user
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
        console.log(`  - ${user.email} (${user.name}) - ${user.role}`)
      })
      return
    }
    
    console.log('✅ Found instructor user:', instructorUser.email)
    console.log('   ID:', instructorUser.id)
    console.log('   Current License Verified:', instructorUser.isLicenseVerified)
    
    // Now approve the user
    const approveResponse = await fetch('https://thepmuguide.com/api/admin/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: instructorUser.id,
        action: 'approve'
      })
    })

    if (!approveResponse.ok) {
      const errorData = await approveResponse.json()
      throw new Error(errorData.error || 'Approval failed')
    }

    const approveData = await approveResponse.json()
    console.log('✅ Instructor account approved successfully!')
    console.log('📊 Updated User Data:')
    console.log('   Email:', approveData.data.email)
    console.log('   Role:', approveData.data.role)
    console.log('   Plan:', approveData.data.selectedPlan)
    console.log('   Has Active Subscription:', approveData.data.hasActiveSubscription)
    console.log('   License Verified:', approveData.data.isLicenseVerified)
    
    console.log('\n🎉 SUCCESS! The instructor account should now have access to Studio Supervision!')
    console.log('📝 Next steps:')
    console.log('1. Logout from the instructor account')
    console.log('2. Login again with admin@universalbeautystudio.com')
    console.log('3. Check the dashboard for the Studio Supervision card')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run the approval
approveInstructor()
  .catch((error) => {
    console.error('❌ Approval failed:', error)
    process.exit(1)
  })
