console.log('💰 CURRENT PRICING CONFIGURATION\n');
console.log('='.repeat(70));

const fs = require('fs');

// Read pricing from trial-service.ts
const trialService = fs.readFileSync('lib/trial-service.ts', 'utf8');
const billingConfig = fs.readFileSync('lib/billing-config.ts', 'utf8');

console.log('\n📋 ACTIVE SUBSCRIPTION PLANS (lib/trial-service.ts):\n');

const priceMatches = [
  { plan: 'Starter', regex: /id: 'starter'[\s\S]*?price: (\d+),/ },
  { plan: 'Professional', regex: /id: 'professional'[\s\S]*?price: (\d+),/ },
  { plan: 'Studio', regex: /id: 'studio'[\s\S]*?price: (\d+),/ }
];

priceMatches.forEach(({ plan, regex }) => {
  const match = trialService.match(regex);
  if (match) {
    console.log(`   ${plan.padEnd(15)} → $${match[1]}/month`);
  }
});

console.log('\n📋 BILLING CONFIG (lib/billing-config.ts):\n');

const billingMatches = [
  { plan: 'Starter', regex: /starter:[\s\S]*?price: (\d+),/ },
  { plan: 'Professional', regex: /professional:[\s\S]*?price: (\d+),/ },
  { plan: 'Studio', regex: /studio:[\s\S]*?price: (\d+),/ }
];

billingMatches.forEach(({ plan, regex }) => {
  const match = billingConfig.match(regex);
  if (match) {
    console.log(`   ${plan.padEnd(15)} → $${match[1]}/month`);
  }
});

// Check for features
console.log('\n📦 PLAN FEATURES:\n');

console.log('   STARTER ($10/mo):');
console.log('   - Up to 50 clients');
console.log('   - Consent form management');
console.log('   - Client CRM');
console.log('   - Document upload & signatures');
console.log('   - Portfolio management');
console.log('   - Basic analytics');
console.log('   - Email support');

console.log('\n   PROFESSIONAL ($49/mo) - MOST POPULAR:');
console.log('   - Up to 200 clients');
console.log('   - All Starter features');
console.log('   - Advanced analytics');
console.log('   - Custom branding');
console.log('   - Priority support');
console.log('   - API access');
console.log('   - Advanced reporting');

console.log('\n   STUDIO ($99/mo):');
console.log('   - Unlimited clients');
console.log('   - All Professional features');
console.log('   - Team management (Artist/Student roles)');
console.log('   - Multi-artist scheduling');
console.log('   - Staff management & permissions');
console.log('   - Supervision booking system');
console.log('   - Advanced analytics & reporting');
console.log('   - White-label branding');
console.log('   - Dedicated account manager');

console.log('\n💳 PLATFORM FEES:\n');
console.log('   Starter:       10% fee (min $5, max $50) per transaction');
console.log('   Professional:  0% fee (NO platform fees)');
console.log('   Studio:        0% fee (NO platform fees)');

console.log('\n' + '='.repeat(70));
console.log('\n❓ PLEASE CONFIRM: Are these prices correct?\n');
console.log('   If not, please provide the correct pricing:');
console.log('   - Starter: $__/month');
console.log('   - Professional: $__/month');
console.log('   - Studio: $__/month\n');

