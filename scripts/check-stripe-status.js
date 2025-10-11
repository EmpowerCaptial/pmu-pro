const { PrismaClient } = require('@prisma/client');

const prodDbUrl = "postgres://5890c2e407a85b65bf7dc0b6b8713ba23b23197329c65c44bcd9b99cbf6b1db3:sk_tY0xAe_zsUcKhA6HPxSz2@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: { db: { url: prodDbUrl } }
});

async function checkStripeStatus() {
  try {
    console.log('💳 STRIPE CONNECTION STATUS CHECK\n');
    console.log('='.repeat(70));
    
    const owner = await prisma.user.findUnique({
      where: { email: 'Tyronejackboy@gmail.com' },
      select: {
        name: true,
        email: true,
        stripeConnectAccountId: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true
      }
    });
    
    if (!owner) {
      console.log('❌ Owner not found!');
      return;
    }
    
    console.log('\n👤 Owner: ' + owner.name);
    console.log('   Email: ' + owner.email);
    console.log('\n📊 Stripe Status:\n');
    
    const hasStripeConnect = !!owner.stripeConnectAccountId;
    const hasStripeCustomer = !!owner.stripeCustomerId;
    const hasSubscription = !!owner.stripeSubscriptionId;
    
    console.log('   Stripe Connect Account:', hasStripeConnect ? '✅ Connected' : '❌ NOT CONNECTED');
    if (hasStripeConnect) {
      console.log('      Account ID:', owner.stripeConnectAccountId);
    }
    
    console.log('\n   Stripe Customer:', hasStripeCustomer ? '✅ Exists' : '❌ Not created');
    if (hasStripeCustomer) {
      console.log('      Customer ID:', owner.stripeCustomerId);
    }
    
    console.log('\n   Stripe Subscription:', hasSubscription ? '✅ Active' : 'ℹ️  Not on paid plan');
    if (hasSubscription) {
      console.log('      Subscription ID:', owner.stripeSubscriptionId);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n🎯 STRIPE REQUIREMENTS FOR LAUNCH:\n');
    
    console.log('✅ **Stripe Connect (Receiving Payments):**');
    if (!hasStripeConnect) {
      console.log('   Status: NOT CONNECTED ⚠️');
      console.log('   Impact: CANNOT receive payments from clients');
      console.log('   Required: YES (if accepting payments)');
      console.log('   Setup: Visit /stripe-connect or use Stripe dashboard');
      console.log('   Timeline: BEFORE first paid booking');
    } else {
      console.log('   Status: CONNECTED ✅');
      console.log('   Impact: CAN receive payments');
      console.log('   Action: None needed');
    }
    
    console.log('\n✅ **Stripe Customer (Subscription Payments):**');
    if (!hasStripeCustomer) {
      console.log('   Status: NOT SET ℹ️');
      console.log('   Impact: Can\'t pay for PMU Pro subscription via Stripe');
      console.log('   Required: NO (can use other payment methods)');
      console.log('   Action: Optional');
    } else {
      console.log('   Status: EXISTS ✅');
      console.log('   Impact: Can manage subscription');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n📋 RECOMMENDATION:\n');
    
    if (!hasStripeConnect) {
      console.log('🚨 CRITICAL FOR PAID BOOKINGS:');
      console.log('   If you plan to accept PAID client bookings, Stripe Connect is REQUIRED.');
      console.log('   Without it, clients cannot pay and bookings will fail at payment step.');
      console.log('\n💡 OPTIONS:');
      console.log('   1. Connect Stripe NOW (recommended): Visit /stripe-connect');
      console.log('   2. Launch without payments: Bookings work, but manual payment only');
      console.log('   3. Connect Stripe before first paid booking');
      console.log('\n✅ SYSTEM STILL FUNCTIONAL:');
      console.log('   - Bookings can be created (payment status: pending)');
      console.log('   - All features work except payment processing');
      console.log('   - Can launch ads and onboard users');
      console.log('   - Add Stripe later when ready for payments');
    } else {
      console.log('✅ Stripe Connect is set up!');
      console.log('   You can accept payments immediately.');
      console.log('   Ready to process paid bookings.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStripeStatus();

