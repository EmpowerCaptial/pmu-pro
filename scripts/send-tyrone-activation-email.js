#!/usr/bin/env node

/**
 * Script to send activation email to Tyrone for his Enterprise Studio subscription
 */

const { EmailService } = require('../lib/email-service')

async function sendActivationEmail() {
  try {
    console.log('📧 Sending Enterprise Studio activation email to Tyrone...')
    
    await EmailService.sendSubscriptionUpdateEmail({
      to: 'tyronejackboy@gmail.com',
      userName: 'Tyrone Jackson',
      changeType: 'activation',
      oldPlan: 'starter',
      newPlan: 'studio',
      features: [
        'Enterprise client management',
        'Advanced appointment scheduling',
        'Digital consent forms',
        'AI skin analysis',
        'Portfolio management',
        'Advanced reporting',
        'Email marketing',
        'Staff management',
        'Instructor booking system',
        'Enterprise supervision features',
        'Multi-location support',
        'Priority support'
      ],
      message: 'Your Enterprise Studio subscription has been activated! You now have full access to all premium features including the Instructor Booking system and advanced supervision tools. No payment is required for this upgrade.'
    })

    console.log('✅ Activation email sent successfully!')
    console.log('📋 Email details:')
    console.log('  To: tyronejackboy@gmail.com')
    console.log('  Type: Subscription Activation')
    console.log('  Plan: Enterprise Studio')
    console.log('  Features: All premium features included')

  } catch (error) {
    console.error('❌ Error sending activation email:', error)
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
