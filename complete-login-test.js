#!/usr/bin/env node

console.log('🔍 COMPLETE LOGIN TEST - UPDATED VERSION\n');

async function testCompleteLoginFlow() {
  console.log('Step 1: Checking if admin accounts are in GitHub...');
  
  try {
    // Check GitHub has the accounts
    const githubResponse = await fetch('https://raw.githubusercontent.com/EmpowerCaptial/pmu-pro/main/hooks/use-demo-auth.ts');
    const githubContent = await githubResponse.text();
    
    const hasAdmin = githubContent.includes('admin@thepmuguide.com');
    const hasUbsa = githubContent.includes('ubsateam@thepmuguide.com');
    
    console.log('✅ GitHub Status:');
    console.log(`   - admin@thepmuguide.com: ${hasAdmin ? 'FOUND' : 'MISSING'}`);
    console.log(`   - ubsateam@thepmuguide.com: ${hasUbsa ? 'FOUND' : 'MISSING'}`);
    
    if (!hasAdmin || !hasUbsa) {
      console.log('❌ Accounts still missing from GitHub - deployment not ready');
      return;
    }
    
    console.log('\nStep 2: Testing live site login page...');
    
    // Test the login page loads
    const pageResponse = await fetch('https://thepmuguide.com/auth/login');
    console.log(`✅ Login page status: ${pageResponse.status}`);
    
    // Wait a moment for Vercel to deploy
    console.log('\nStep 3: Waiting for Vercel deployment (30 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log('\nStep 4: Testing API authentication...');
    
    // Test admin account
    const adminLogin = await fetch('https://thepmuguide.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@thepmuguide.com',
        password: 'ubsa2024!'
      })
    });
    
    const adminResult = await adminLogin.json();
    console.log(`✅ Admin API test: ${adminResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (!adminResult.success) {
      console.log(`   Error: ${adminResult.error}`);
    }
    
    // Test UBSA account  
    const ubsaLogin = await fetch('https://thepmuguide.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ubsateam@thepmuguide.com',
        password: 'ubsa2024!'
      })
    });
    
    const ubsaResult = await ubsaLogin.json();
    console.log(`✅ UBSA API test: ${ubsaResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (!ubsaResult.success) {
      console.log(`   Error: ${ubsaResult.error}`);
    }
    
    console.log('\n🎯 FINAL VERDICT:');
    if (adminResult.success && ubsaResult.success) {
      console.log('🎉 LOGIN SHOULD NOW WORK ON ALL DEVICES!');
      console.log('   - GitHub: Updated ✅');
      console.log('   - API: Working ✅');
      console.log('   - Accounts: Added ✅');
      console.log('\n👉 TRY LOGGING IN NOW!');
    } else {
      console.log('❌ Still issues - need more debugging');
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testCompleteLoginFlow();
