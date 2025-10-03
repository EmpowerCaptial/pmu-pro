#!/usr/bin/env node

/**
 * Fix instructor license verification using API
 */

async function fixInstructorLicenseAPI() {
  console.log('🔧 Fixing instructor license verification via API...')
  
  try {
    // Call the fix API endpoint
    const response = await fetch('https://thepmuguide.com/api/fix-instructor-license', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@universalbeautystudio.com'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'API call failed')
    }

    const data = await response.json()
    console.log('✅ License verification fixed successfully!')
    console.log('📊 Updated User Data:')
    console.log('   Email:', data.user.email)
    console.log('   Role:', data.user.role)
    console.log('   Plan:', data.user.selectedPlan)
    console.log('   Has Active Subscription:', data.user.hasActiveSubscription)
    console.log('   License Verified:', data.user.isLicenseVerified)
    
    console.log('\n🎉 SUCCESS! The instructor account should now have access to Studio Supervision!')
    console.log('📝 Next steps:')
    console.log('1. Logout from the instructor account')
    console.log('2. Login again with admin@universalbeautystudio.com')
    console.log('3. Check the dashboard for the Studio Supervision card')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run the fix
fixInstructorLicenseAPI()
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
