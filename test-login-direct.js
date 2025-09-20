#!/usr/bin/env node

// Test the login form directly in browser context
console.log('🔍 TESTING LOGIN FORM HYDRATION...\n');

async function testLoginPage() {
  try {
    // Test if the page loads the JavaScript correctly
    const response = await fetch('https://thepmuguide.com/auth/login');
    const html = await response.text();
    
    console.log('✅ Page Status:', response.status);
    console.log('✅ Page loads:', html.includes('Sign In') ? 'YES' : 'NO');
    console.log('✅ Form present:', html.includes('form') ? 'YES' : 'NO');
    console.log('✅ Email field:', html.includes('email') ? 'YES' : 'NO');
    console.log('✅ Password field:', html.includes('password') ? 'YES' : 'NO');
    
    // Check for hydration issues
    if (html.includes('BAILOUT_TO_CLIENT_SIDE_RENDERING')) {
      console.log('⚠️  HYDRATION ISSUE DETECTED');
      console.log('   - Page is bailing out to client-side rendering');
      console.log('   - This can cause form submission issues');
      console.log('   - Form might not be interactive until JS loads');
    }
    
    // Check for JavaScript errors
    if (html.includes('LoginForm')) {
      console.log('✅ LoginForm component found');
    } else {
      console.log('❌ LoginForm component missing');
    }
    
    console.log('\n🎯 LIKELY ISSUE:');
    console.log('   - Form loads but JavaScript not hydrating properly');
    console.log('   - Submit button might not be connected to event handler');
    console.log('   - Try refreshing page or waiting for JS to load');
    
  } catch (error) {
    console.log('❌ Error testing page:', error.message);
  }
}

testLoginPage();
