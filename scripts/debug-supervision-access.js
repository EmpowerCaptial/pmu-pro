#!/usr/bin/env node

/**
 * Debug Supervision Access for Tyrone
 * 
 * This will help us understand why the card might not be showing
 */

async function debugSupervisionAccess() {
  console.log('🔍 DEBUGGING SUPERVISION ACCESS FOR TYRONE...')
  console.log('==============================================')
  
  try {
    // Step 1: Get Tyrone's login data
    console.log('📊 Step 1: Getting Tyrone\'s login data')
    const loginResponse = await fetch('https://thepmuguide.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'Tyronejackboy@gmail.com',
        password: 'Tyronej22!'
      })
    })
    
    const loginResult = await loginResponse.json()
    
    if (!loginResponse.ok || !loginResult.success) {
      console.log('❌ Login failed:', loginResult)
      return
    }
    
    const user = loginResult.user
    console.log('✅ Login successful!')
    console.log('User data:', JSON.stringify(user, null, 2))
    
    // Step 2: Simulate the exact same logic as the dashboard component
    console.log('\n📊 Step 2: Simulating dashboard component logic')
    
    // This mimics the useEffect in DashboardCards component
    const currentUser = user
    
    // Simulate the checkStudioSupervisionAccess call
    const supervisionUser = {
      id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role || 'artist',
      selectedPlan: currentUser.selectedPlan || 'starter', // This might be the issue!
      isLicenseVerified: currentUser.isLicenseVerified || false,
      hasActiveSubscription: currentUser.hasActiveSubscription || false
    }
    
    console.log('Supervision User Object:', JSON.stringify(supervisionUser, null, 2))
    
    // Apply the exact gate logic
    const isEnterpriseStudio = supervisionUser.selectedPlan === 'studio' && supervisionUser.hasActiveSubscription
    
    console.log('\nGate Logic Results:')
    console.log('- selectedPlan:', supervisionUser.selectedPlan)
    console.log('- hasActiveSubscription:', supervisionUser.hasActiveSubscription)
    console.log('- isEnterpriseStudio:', isEnterpriseStudio)
    
    if (!isEnterpriseStudio) {
      console.log('❌ FAILED: Not Enterprise Studio')
      return
    }
    
    if (!supervisionUser.isLicenseVerified) {
      console.log('❌ FAILED: License not verified')
      return
    }
    
    let supervisionRole = 'NONE'
    switch (supervisionUser.role) {
      case 'admin':
      case 'staff':
        supervisionRole = 'ADMIN'
        break
      case 'artist':
        if (isEnterpriseStudio && supervisionUser.isLicenseVerified) {
          supervisionRole = 'INSTRUCTOR'
        }
        break
      case 'apprentice':
        supervisionRole = 'APPRENTICE'
        break
    }
    
    const accessResult = {
      canAccess: supervisionRole !== 'NONE',
      isEnterpriseStudio: isEnterpriseStudio,
      userRole: supervisionRole
    }
    
    console.log('\n📊 Step 3: Final Access Result')
    console.log('==============================')
    console.log('Access Result:', JSON.stringify(accessResult, null, 2))
    
    // Step 4: Check if card should be displayed
    console.log('\n📊 Step 4: Card Display Logic')
    console.log('=============================')
    
    const shouldShowCard = accessResult.canAccess && accessResult.userRole === 'INSTRUCTOR'
    console.log('Card Display Condition:')
    console.log('- supervisionAccess?.canAccess:', accessResult.canAccess ? '✅' : '❌')
    console.log('- supervisionAccess?.userRole === "INSTRUCTOR":', accessResult.userRole === 'INSTRUCTOR' ? '✅' : '❌')
    console.log('- Should show card:', shouldShowCard ? '✅ YES' : '❌ NO')
    
    if (shouldShowCard) {
      console.log('\n🎉 THE CARD SHOULD BE VISIBLE!')
      console.log('If you don\'t see it, there might be:')
      console.log('1. A JavaScript error preventing the component from rendering')
      console.log('2. The supervisionAccess state not being set properly')
      console.log('3. A CSS issue hiding the card')
      console.log('4. You might not be on the main dashboard page')
    } else {
      console.log('\n❌ THE CARD WILL NOT BE DISPLAYED')
      console.log('Reason:', accessResult.userRole === 'NONE' ? 'Invalid role' : 'Missing requirements')
    }
    
    // Step 5: Check for potential issues
    console.log('\n📊 Step 5: Potential Issues Check')
    console.log('================================')
    
    console.log('Potential Issues:')
    if (currentUser.selectedPlan !== 'studio') {
      console.log('- ⚠️  selectedPlan mismatch: API returned "' + currentUser.selectedPlan + '" but expected "studio"')
    }
    if (!currentUser.isLicenseVerified) {
      console.log('- ⚠️  License not verified in API response')
    }
    if (!currentUser.hasActiveSubscription) {
      console.log('- ⚠️  Subscription not active in API response')
    }
    if (currentUser.role !== 'artist') {
      console.log('- ⚠️  Role mismatch: expected "artist" but got "' + currentUser.role + '"')
    }
    
  } catch (error) {
    console.error('\n❌ DEBUG FAILED:')
    console.error(error.message)
  }
}

// Run the debug
debugSupervisionAccess()
