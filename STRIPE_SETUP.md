# Stripe Integration Setup Guide

Your PMU Pro application now has a complete Stripe integration! Here's how to connect your Stripe account:

## 🚀 Quick Setup Steps

### 1. Create a Stripe Account
- Go to [stripe.com](https://stripe.com) and create an account
- Complete your business verification (required for live payments)

### 2. Get Your API Keys
In your Stripe Dashboard:
1. Go to **Developers > API Keys**
2. Copy your **Publishable key** and **Secret key**
3. For testing, use the **Test** keys first

### 3. Update Environment Variables
Replace the placeholder values in your `.env.local` file:

```bash
# Replace with your actual Stripe keys
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

### 4. Create Products and Prices
In Stripe Dashboard:
1. Go to **Products**
2. Create two products:
   - **PMU Tools** - $22/month
   - **PMU Tools + Local Listing** - $35/month
3. Copy the **Price IDs** and update your `.env.local`:

```bash
STRIPE_BASIC_PRICE_ID=price_1234567890abcdef
STRIPE_PREMIUM_PRICE_ID=price_0987654321fedcba
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_1234567890abcdef
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_0987654321fedcba
```

### 5. Set Up Webhooks (Important!)
1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Use this URL: `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** and add it to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
```

## 🧪 Testing

### Test Cards
Use these test card numbers in Stripe Checkout:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiry date and any 3-digit CVC

### Test the Flow
1. Start your development server: `npm run dev`
2. Go to `/billing`
3. Click "Get Started" or "Upgrade to Premium"
4. Complete checkout with a test card
5. You should be redirected to `/billing/success`

## 🔥 Features Included

### ✅ What's Working
- **Stripe Checkout**: Secure hosted payment pages
- **Subscription Management**: Automatic recurring billing
- **Webhook Handling**: Real-time payment event processing
- **Success/Cancel Pages**: Complete user flow
- **Error Handling**: Robust error management

### 🛠️ What You Need to Add
- **Database Integration**: Store subscription data in your database
- **User Authentication**: Link subscriptions to user accounts
- **Customer Portal**: Let users manage their subscriptions
- **Email Notifications**: Send confirmation emails

## 📚 Next Steps

1. **Test Everything**: Use test mode first
2. **Add Database Logic**: Update webhook handlers to save subscription data
3. **User Management**: Integrate with your auth system
4. **Go Live**: Switch to live keys when ready

## 🆘 Need Help?

- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)
- **Test Your Webhooks**: Use Stripe CLI or ngrok for local testing
- **Stripe Support**: Available 24/7 in your dashboard

Your PMU Pro app is now ready for payments! 🎉
