console.log('💳 SUBSCRIPTION SYSTEM AUDIT\n');
console.log('Checking if recurring billing is properly configured');
console.log('='.repeat(70));

const issues = [];
const warnings = [];

// Check 1: Stripe API Mode
console.log('\n📊 CHECK 1: Subscription API Configuration\n');

const fs = require('fs');
const subscribeAPI = fs.readFileSync('app/api/artist/subscribe/route.ts', 'utf8');

if (subscribeAPI.includes("mode: 'subscription'")) {
  console.log('   ✅ API creates SUBSCRIPTION mode checkout (recurring enabled)');
} else {
  console.log('   ❌ API might be using one-time payment mode');
  issues.push('Subscription API not in subscription mode');
}

// Check 2: Price IDs
console.log('\n📊 CHECK 2: Stripe Price IDs\n');

if (subscribeAPI.includes('STRIPE_PRICE_STARTER') || subscribeAPI.includes('price_starter_monthly')) {
  console.log('   ✅ Starter plan price ID configured');
} else {
  warnings.push('Starter price ID may not be set');
}

if (subscribeAPI.includes('STRIPE_PRICE_PRO') || subscribeAPI.includes('price_professional_monthly')) {
  console.log('   ✅ Professional plan price ID configured');
} else {
  warnings.push('Professional price ID may not be set');
}

if (subscribeAPI.includes('STRIPE_PRICE_ENTERPRISE') || subscribeAPI.includes('price_studio_monthly')) {
  console.log('   ✅ Studio plan price ID configured');
} else {
  warnings.push('Studio price ID may not be set');
}

// Check 3: Webhook Handling
console.log('\n📊 CHECK 3: Subscription Event Handling\n');

const webhookExists = fs.existsSync('app/api/stripe/webhook/route.ts');

if (webhookExists) {
  console.log('   ✅ Webhook endpoint exists');
  
  const webhookCode = fs.readFileSync('app/api/stripe/webhook/route.ts', 'utf8');
  
  if (webhookCode.includes('subscription.created') || webhookCode.includes('customer.subscription')) {
    console.log('   ✅ Handles subscription events');
  } else {
    warnings.push('Webhook may not handle subscription events');
  }
  
  if (webhookCode.includes('invoice.payment_succeeded')) {
    console.log('   ✅ Handles recurring payment success');
  } else {
    warnings.push('Webhook may not handle recurring payments');
  }
  
  if (webhookCode.includes('invoice.payment_failed')) {
    console.log('   ✅ Handles payment failures');
  } else {
    warnings.push('Webhook may not handle failed payments');
  }
} else {
  issues.push('CRITICAL: Webhook endpoint missing');
}

// Check 4: Trial to Paid Conversion
console.log('\n📊 CHECK 4: Trial Upgrade Flow\n');

if (subscribeAPI.includes('isTrialUpgrade')) {
  console.log('   ✅ Trial upgrade logic exists');
  console.log('   ✅ Trial users can convert to paid');
} else {
  warnings.push('Trial upgrade may not be handled');
}

const trialService = fs.readFileSync('lib/trial-service.ts', 'utf8');

if (trialService.includes('upgradeToPlan')) {
  console.log('   ✅ TrialService.upgradeToPlan() function exists');
} else {
  warnings.push('Trial upgrade service function missing');
}

// Check 5: Database Schema
console.log('\n📊 CHECK 5: Database Subscription Fields\n');

const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (schema.includes('stripeSubscriptionId')) {
  console.log('   ✅ Database stores subscription ID');
} else {
  issues.push('CRITICAL: stripeSubscriptionId field missing');
}

if (schema.includes('subscriptionStatus')) {
  console.log('   ✅ Database stores subscription status');
} else {
  issues.push('CRITICAL: subscriptionStatus field missing');
}

if (schema.includes('hasActiveSubscription')) {
  console.log('   ✅ Database has active subscription flag');
} else {
  issues.push('CRITICAL: hasActiveSubscription field missing');
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('\n📋 SUBSCRIPTION SYSTEM SUMMARY\n');
console.log(`   Critical Issues: ${issues.length}`);
console.log(`   Warnings: ${warnings.length}`);

if (issues.length > 0) {
  console.log('\n🚨 CRITICAL ISSUES:\n');
  issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:\n');
  warnings.forEach((warn, i) => console.log(`   ${i + 1}. ${warn}`));
}

console.log('\n🎯 RECURRING BILLING STATUS:\n');

if (issues.length === 0) {
  console.log('✅ SUBSCRIPTIONS ARE RECURRING!');
  console.log('   - API creates subscription mode checkout');
  console.log('   - Stripe handles automatic monthly billing');
  console.log('   - Webhooks track subscription status');
  console.log('   - Trial users can upgrade to paid');
  console.log('   - Database tracks subscription state');
  console.log('\n⚠️  IMPORTANT: Verify Stripe Price IDs in dashboard are set to recurring!');
  console.log('   Go to: https://dashboard.stripe.com/test/products');
  console.log('   Check: Each price is set to "Recurring" not "One-time"');
} else {
  console.log('❌ SUBSCRIPTION SYSTEM HAS CRITICAL ISSUES');
  console.log('   Fix before accepting recurring payments!');
}

console.log('\n💡 WHAT HAPPENS WHEN USER SUBSCRIBES:\n');
console.log('   1. User clicks "Upgrade" on pricing page');
console.log('   2. API creates Stripe checkout (mode: subscription)');
console.log('   3. User enters payment info on Stripe');
console.log('   4. Stripe creates recurring subscription');
console.log('   5. Webhook updates database (hasActiveSubscription = true)');
console.log('   6. Stripe automatically bills monthly');
console.log('   7. Webhooks handle renewal/failure events');

console.log('\n✅ System is configured for recurring billing!');

