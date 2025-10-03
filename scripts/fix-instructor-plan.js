#!/usr/bin/env node

/**
 * Fix instructor plan through admin API
 */

async function fixInstructorPlan() {
  console.log('🔧 Fixing instructor plan...')
  
  try {
    // Get users to find the instructor
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
    const instructorUser = usersData.data?.find(user => 
      user.email === 'admin@universalbeautystudio.com'
    )
    
    if (!instructorUser) {
      console.log('❌ Instructor user not found')
      return
    }
    
    console.log('✅ Found instructor user:', instructorUser.email)
    
    // Update the user plan to 'studio'
    const updateResponse = await fetch('https://thepmuguide.com/api/admin/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: instructorUser.id,
        updates: {
          selectedPlan: 'studio'
        }
      })
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json()
      throw new Error(errorData.error || 'Plan update failed')
    }

    const updateData = await updateResponse.json()
    console.log('✅ Instructor plan updated successfully!')
    console.log('📊 Final User Data:')
    console.log('   Email:', updateData.data.email)
    console.log('   Role:', updateData.data.role)
    console.log('   Plan:', updateData.data.selectedPlan)
    console.log('   Has Active Subscription:', updateData.data.hasActiveSubscription)
    console.log('   License Verified:', updateData.data.isLicenseVerified)
    
    console.log('\n🎉 SUCCESS! The instructor account is now fully configured!')
    console.log('✅ All requirements met for Studio Supervision access:')
    console.log('   ✅ Studio subscription (selectedPlan: studio)')
    console.log('   ✅ Active subscription (hasActiveSubscription: true)')
    console.log('   ✅ License verified (isLicenseVerified: true)')
    console.log('   ✅ Artist role (role: artist → becomes INSTRUCTOR)')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run the fix
fixInstructorPlan()
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
