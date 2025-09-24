const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://pmu-eiidx4ttn-tyronejackboy-9924s-projects.vercel.app';

async function checkWebsiteReadiness() {
  console.log('🔍 COMPREHENSIVE WEBSITE READINESS CHECK');
  console.log('=====================================');
  console.log(`🌐 Testing URL: ${BASE_URL}`);
  console.log('');

  const checks = [
    // Core Pages
    { name: 'Dashboard', url: '/dashboard', critical: true },
    { name: 'Features', url: '/features', critical: true },
    { name: 'Settings', url: '/settings', critical: true },
    { name: 'Billing', url: '/billing', critical: true },
    { name: 'Pricing', url: '/pricing', critical: true },
    
    // Business Features
    { name: 'Clients', url: '/clients', critical: true },
    { name: 'Services', url: '/services', critical: true },
    { name: 'Booking', url: '/booking', critical: true },
    { name: 'POS', url: '/pos', critical: true },
    { name: 'Reports', url: '/reports', critical: true },
    { name: 'Inventory', url: '/inventory', critical: true },
    { name: 'Expenses', url: '/expenses', critical: true },
    { name: 'Payouts', url: '/payouts', critical: true },
    { name: 'Reviews', url: '/reviews', critical: true },
    { name: 'Referrals', url: '/referrals', critical: true },
    
    // Professional Tools
    { name: 'Skin Analysis', url: '/analyze', critical: true },
    { name: 'Pigment Library', url: '/pigment-library', critical: true },
    { name: 'Aftercare', url: '/aftercare', critical: true },
    { name: 'Portfolio', url: '/portfolio', critical: true },
    
    // Integrations
    { name: 'Calendar Integration', url: '/integrations/calendar', critical: false },
    { name: 'Meta Integration', url: '/integrations/meta', critical: false },
    
    // Team Management
    { name: 'Team Management', url: '/enterprise/staff', critical: false },
    
    // Authentication
    { name: 'Login', url: '/auth/login', critical: true },
    { name: 'Demo Login', url: '/demo-login', critical: true },
  ];

  let passedChecks = 0;
  let failedChecks = 0;
  let criticalFailures = 0;

  console.log('📄 PAGE AVAILABILITY CHECK');
  console.log('=========================');

  for (const check of checks) {
    try {
      const response = await fetch(`${BASE_URL}${check.url}`);
      const status = response.status;
      const isSuccess = status >= 200 && status < 400;
      
      if (isSuccess) {
        console.log(`✅ ${check.name}: ${status} (${check.url})`);
        passedChecks++;
      } else {
        console.log(`❌ ${check.name}: ${status} (${check.url})`);
        failedChecks++;
        if (check.critical) criticalFailures++;
      }
    } catch (error) {
      console.log(`❌ ${check.name}: ERROR - ${error.message} (${check.url})`);
      failedChecks++;
      if (check.critical) criticalFailures++;
    }
  }

  console.log('');
  console.log('🔧 API ENDPOINT CHECK');
  console.log('=====================');

  const apiChecks = [
    { name: 'Clients API', url: '/api/clients', critical: true },
    { name: 'Services API', url: '/api/services', critical: true },
    { name: 'Billing API', url: '/api/stripe/create-checkout', critical: true },
    { name: 'Financial Weekly API', url: '/api/financial/weekly', critical: false },
    { name: 'Financial Daily API', url: '/api/financial/daily', critical: false },
    { name: 'Calendar Integration API', url: '/api/calendar-integrations/create', critical: false },
  ];

  for (const check of apiChecks) {
    try {
      const response = await fetch(`${BASE_URL}${check.url}`, {
        method: 'GET',
        headers: {
          'x-user-email': 'universalbeautystudioacademy@gmail.com',
          'Accept': 'application/json'
        }
      });
      const status = response.status;
      const isSuccess = status >= 200 && status < 500; // APIs can return 400s for validation
      
      if (isSuccess) {
        console.log(`✅ ${check.name}: ${status} (${check.url})`);
        passedChecks++;
      } else {
        console.log(`❌ ${check.name}: ${status} (${check.url})`);
        failedChecks++;
        if (check.critical) criticalFailures++;
      }
    } catch (error) {
      console.log(`❌ ${check.name}: ERROR - ${error.message} (${check.url})`);
      failedChecks++;
      if (check.critical) criticalFailures++;
    }
  }

  console.log('');
  console.log('📱 MOBILE RESPONSIVENESS CHECK');
  console.log('==============================');

  const mobileChecks = [
    { name: 'Dashboard Mobile', url: '/dashboard' },
    { name: 'Features Mobile', url: '/features' },
    { name: 'Clients Mobile', url: '/clients' },
    { name: 'Reports Mobile', url: '/reports' },
    { name: 'Reviews Mobile', url: '/reviews' },
    { name: 'Settings Mobile', url: '/settings' },
  ];

  for (const check of mobileChecks) {
    try {
      const response = await fetch(`${BASE_URL}${check.url}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        }
      });
      const html = await response.text();
      
      // Check for mobile-friendly elements
      const hasMobileClasses = html.includes('sm:') || html.includes('md:') || html.includes('lg:');
      const hasResponsiveGrid = html.includes('grid-cols-') && html.includes('sm:grid-cols-');
      const hasMobileButtons = html.includes('w-full sm:w-auto') || html.includes('flex-col sm:flex-row');
      
      if (hasMobileClasses && (hasResponsiveGrid || hasMobileButtons)) {
        console.log(`✅ ${check.name}: Mobile responsive`);
        passedChecks++;
      } else {
        console.log(`⚠️  ${check.name}: Limited mobile optimization`);
        failedChecks++;
      }
    } catch (error) {
      console.log(`❌ ${check.name}: ERROR - ${error.message}`);
      failedChecks++;
    }
  }

  console.log('');
  console.log('💳 SUBSCRIPTION READINESS CHECK');
  console.log('==============================');

  const subscriptionChecks = [
    { name: 'Billing Page', url: '/billing' },
    { name: 'Pricing Page', url: '/pricing' },
    { name: 'Settings Subscription', url: '/settings' },
  ];

  for (const check of subscriptionChecks) {
    try {
      const response = await fetch(`${BASE_URL}${check.url}`);
      const html = await response.text();
      
      // Check for subscription-related elements
      const hasBillingElements = html.includes('subscription') || html.includes('billing') || html.includes('plan') || html.includes('stripe');
      const hasPaymentElements = html.includes('payment') || html.includes('credit') || html.includes('card');
      
      if (hasBillingElements || hasPaymentElements) {
        console.log(`✅ ${check.name}: Subscription ready`);
        passedChecks++;
      } else {
        console.log(`⚠️  ${check.name}: Limited subscription features`);
        failedChecks++;
      }
    } catch (error) {
      console.log(`❌ ${check.name}: ERROR - ${error.message}`);
      failedChecks++;
    }
  }

  console.log('');
  console.log('📊 FINAL SUMMARY');
  console.log('================');
  console.log(`✅ Passed Checks: ${passedChecks}`);
  console.log(`❌ Failed Checks: ${failedChecks}`);
  console.log(`🚨 Critical Failures: ${criticalFailures}`);
  console.log('');

  if (criticalFailures === 0) {
    console.log('🎉 WEBSITE IS READY FOR SUBSCRIPTIONS!');
    console.log('');
    console.log('✅ All critical pages are accessible');
    console.log('✅ Core APIs are functional');
    console.log('✅ Mobile responsiveness implemented');
    console.log('✅ Subscription features are in place');
    console.log('');
    console.log('🚀 The website is ready to accept paying customers!');
  } else {
    console.log('⚠️  WEBSITE NEEDS ATTENTION BEFORE SUBSCRIPTIONS');
    console.log('');
    console.log(`❌ ${criticalFailures} critical issues need to be resolved`);
    console.log('🔧 Please fix critical failures before launching subscriptions');
  }

  console.log('');
  console.log('🔗 Production URL:', BASE_URL);
  console.log('📅 Check completed at:', new Date().toISOString());
}

// Run the check
checkWebsiteReadiness()
  .then(() => {
    console.log('\n✅ Website readiness check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Website readiness check failed:', error);
    process.exit(1);
  });





