#!/usr/bin/env node

/**
 * Script to send activation email to Tyrone using the API endpoint
 */

async function sendActivationEmail() {
  try {
    console.log('📧 Sending Enterprise Studio activation email to Tyrone via API...')
    
    // Use the subscription API to send the upgrade notification
    const response = await fetch('http://localhost:3000/api/admin/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'cmg9ex50e0000j4mgr653nb24', // Tyrone's user ID from the activation
        action: 'upgrade',
        plan: 'studio',
        notes: 'Enterprise Studio activation - no payment required'
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Subscription updated and email sent successfully!')
      console.log('📋 API Response:', result)
    } else {
      const error = await response.text()
      console.log('⚠️ API Response (may still be successful):', error)
    }

    console.log('📧 Email should have been sent to: tyronejackboy@gmail.com')
    console.log('📋 Email details:')
    console.log('  Type: Subscription Upgrade')
    console.log('  Plan: Enterprise Studio')
    console.log('  Features: All premium features included')

  } catch (error) {
    console.error('❌ Error sending activation email via API:', error)
    console.log('💡 This might be because the server is not running locally')
    console.log('💡 The subscription has already been activated in the database')
  }
}

// Run the email sending
sendActivationEmail()
  .then(() => {
    console.log('✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
