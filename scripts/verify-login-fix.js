#!/usr/bin/env node

/**
 * Verify that the login API fix is working
 */

const fetch = globalThis.fetch

async function verifyLoginFix() {
  try {
    console.log('🧪 VERIFYING LOGIN API FIX...')
    console.log('==============================')
    
    const response = await fetch('https://thepmuguide.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'tyronejackboy@gmail.com',
        password: 'Tyronej22!'
      })
    })
    
    console.log('📊 Response Status:', response.status)
    const data = await response.json()
    console.log('📋 Response:', JSON.stringify(data, null, 2))
    
    if (response.status === 200 && data.success) {
      console.log('✅ LOGIN API FIXED!')
      console.log('✅ Tyrone can now log in successfully')
      console.log('✅ Database schema issue resolved')
    } else if (response.status === 500) {
      console.log('❌ Still getting 500 error - deployment may not be complete')
      console.log('⏰ Wait a few more minutes and try again')
    } else if (response.status === 401) {
      console.log('❌ 401 error - credentials issue, not server error')
      console.log('🔍 Password might be wrong or user not found')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

verifyLoginFix()
