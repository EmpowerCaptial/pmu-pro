# Stripe Payment Setup Instructions

## Current Issue
The payment system is failing because Stripe price IDs are not properly configured. Here's how to fix it:

## Step 1: Create Stripe Products and Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Products** → **Add Product**
3. Create two products:

### Basic Plan Product
- **Name**: PMU Pro Basic
- **Price**: $10/month
- **Billing**: Recurring (monthly)
- **Save the Price ID** (starts with `price_`)

### Premium Plan Product  
- **Name**: PMU Pro Premium
- **Price**: $36.99/month
- **Billing**: Recurring (monthly)
- **Save the Price ID** (starts with `price_`)

## Step 2: Update Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Stripe Price IDs (replace with your actual price IDs)
STRIPE_BASIC_PRICE_ID=price_your_basic_price_id_here
STRIPE_PREMIUM_PRICE_ID=price_your_premium_price_id_here
```

## Step 3: Update Billing Configuration

Update `lib/billing-config.ts` with your actual price IDs:

```typescript
export const BILLING_PLANS = {
  basic: {
    // ... other config
    priceId: 'price_your_actual_basic_price_id', // Replace this
  },
  premium: {
    // ... other config  
    priceId: 'price_your_actual_premium_price_id', // Replace this
  }
}
```

## Step 4: Test the Payment Flow

1. Start your development server
2. Go to `/artist-signup`
3. Fill out the form and submit
4. You'll be redirected to `/billing`
5. Click on a plan to test checkout

## Common Issues and Solutions

### "Failed to start checkout" Error
- Check that your Stripe secret key is correct
- Verify price IDs exist in your Stripe dashboard
- Ensure environment variables are loaded

### "Stripe is not configured" Error  
- Make sure all environment variables are set
- Restart your development server after adding env vars

### Test Mode vs Live Mode
- Use test keys for development (`sk_test_`, `pk_test_`)
- Use live keys for production (`sk_live_`, `pk_live_`)
- Test with Stripe's test card numbers (e.g., `4242 4242 4242 4242`)

## Test Card Numbers

Use these for testing:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

## Need Help?

If you're still having issues:
1. Check the browser console for error messages
2. Check your server logs for API errors
3. Verify Stripe webhook endpoints are configured
4. Ensure your Stripe account is active and not in restricted mode
