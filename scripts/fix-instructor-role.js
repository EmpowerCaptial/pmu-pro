#!/usr/bin/env node

/**
 * Fix instructor role through admin API
 */

async function fixInstructorRole() {
  console.log('🔧 Fixing instructor role...')
  
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
    
    // Update the user role to 'artist'
    const updateResponse = await fetch('https://thepmuguide.com/api/admin/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: instructorUser.id,
        updates: {
          role: 'artist'
        }
      })
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json()
      throw new Error(errorData.error || 'Role update failed')
    }

    const updateData = await updateResponse.json()
    console.log('✅ Instructor role updated successfully!')
    console.log('📊 Updated User Data:')
    console.log('   Email:', updateData.data.email)
    console.log('   Role:', updateData.data.role)
    console.log('   Plan:', updateData.data.selectedPlan)
    console.log('   Has Active Subscription:', updateData.data.hasActiveSubscription)
    console.log('   License Verified:', updateData.data.isLicenseVerified)
    
    console.log('\n🎉 SUCCESS! The instructor account is now fully configured!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run the fix
fixInstructorRole()
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
