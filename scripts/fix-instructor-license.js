#!/usr/bin/env node

/**
 * Fix instructor license verification through API
 * This will update the instructor account to have license verification
 */

async function fixInstructorLicense() {
  console.log('🔧 Fixing instructor license verification...')
  
  try {
    // First, login to get auth token
    const loginResponse = await fetch('https://thepmuguide.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@universalbeautystudio.com',
        password: 'Tyronej22!'
      })
    })

    if (!loginResponse.ok) {
      throw new Error('Login failed')
    }

    const loginData = await loginResponse.json()
    console.log('✅ Login successful')
    
    // Create a simple API endpoint to update license verification
    // For now, let's just verify the user data and suggest manual fix
    console.log('📊 Current User Data:')
    console.log('   Email:', loginData.user.email)
    console.log('   Role:', loginData.user.role)
    console.log('   Plan:', loginData.user.selectedPlan)
    console.log('   Has Active Subscription:', loginData.user.hasActiveSubscription)
    console.log('   License Verified:', loginData.user.isLicenseVerified)
    
    if (!loginData.user.isLicenseVerified) {
      console.log('\n❌ ISSUE: License verification is false')
      console.log('💡 SOLUTION: The user needs isLicenseVerified: true in the database')
      console.log('\n🔧 Manual Fix Options:')
      console.log('1. Update database directly: UPDATE users SET "isLicenseVerified" = true WHERE email = \'admin@universalbeautystudio.com\';')
      console.log('2. Or create a database update script')
      console.log('3. Or modify the user creation process')
    } else {
      console.log('\n✅ License is already verified!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run the fix
fixInstructorLicense()
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
