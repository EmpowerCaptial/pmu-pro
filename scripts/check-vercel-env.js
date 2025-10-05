const { execSync } = require('child_process');

function checkVercelEnvironment() {
  console.log('🔍 CHECKING VERCEL ENVIRONMENT VARIABLES...');
  
  try {
    // Check if vercel CLI is installed
    console.log('\n📊 Step 1: Checking Vercel CLI installation...');
    try {
      const version = execSync('vercel --version', { encoding: 'utf8' }).trim();
      console.log('✅ Vercel CLI installed:', version);
    } catch (error) {
      console.log('❌ Vercel CLI not installed. Installing...');
      execSync('npm install -g vercel', { stdio: 'inherit' });
      console.log('✅ Vercel CLI installed');
    }

    // List environment variables
    console.log('\n📊 Step 2: Listing current environment variables...');
    try {
      const envVars = execSync('vercel env ls', { encoding: 'utf8' });
      console.log('📝 Current environment variables:');
      console.log(envVars);
    } catch (error) {
      console.log('❌ Error listing environment variables:', error.message);
    }

    // Check specific variables we need
    console.log('\n📊 Step 3: Checking critical environment variables...');
    const requiredVars = [
      'SENDGRID_API_KEY',
      'SENDGRID_FROM_EMAIL', 
      'NEXT_PUBLIC_BASE_URL',
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    for (const varName of requiredVars) {
      try {
        const value = execSync(`vercel env pull --environment=production --yes`, { encoding: 'utf8' });
        console.log(`📝 ${varName}: ${process.env[varName] ? 'SET' : 'NOT SET'}`);
      } catch (error) {
        console.log(`📝 ${varName}: Error checking - ${error.message}`);
      }
    }

    console.log('\n🎉 Environment check complete');
    console.log('\n📋 RECOMMENDATIONS:');
    console.log('1. Ensure all required environment variables are set in Vercel dashboard');
    console.log('2. Redeploy the application after setting environment variables');
    console.log('3. Check Vercel function logs for detailed error messages');

  } catch (error) {
    console.error('❌ Error during environment check:', error);
  }
}

if (require.main === module) {
  checkVercelEnvironment();
}

module.exports = { checkVercelEnvironment };
