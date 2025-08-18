# PMU Pro Deployment Guide

## 🚀 Vercel Deployment Setup

Your PMU Pro application is ready for production deployment! Follow these steps to deploy on Vercel.

### 1. Environment Variables Setup

You need to configure these environment variables in your Vercel dashboard:

#### **Required Environment Variables:**

\`\`\`bash
# Database
DATABASE_URL="your-production-database-url"

# JWT Authentication
JWT_SECRET="your-super-secure-jwt-secret-for-production"

# AI Services
GROQ_API_KEY="your-groq-api-key"
OPENAI_API_KEY="your-openai-api-key"

# Stripe (Test Mode - Replace with live keys when ready)
STRIPE_SECRET_KEY="sk_test_your_actual_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_actual_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_signing_secret"
STRIPE_BASIC_PRICE_ID="price_your_basic_plan_price_id"
STRIPE_PREMIUM_PRICE_ID="price_your_premium_plan_price_id"

# Public Variables (Client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_actual_stripe_publishable_key"
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID="price_your_basic_plan_price_id"
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID="price_your_premium_plan_price_id"

# NextAuth (Optional - if using NextAuth later)
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-nextauth-secret"
\`\`\`

### 2. Setting Environment Variables on Vercel

1. **Go to your Vercel dashboard**: https://vercel.com/dashboard
2. **Select your project**: `pmu-pro`
3. **Go to Settings** → **Environment Variables**
4. **Add each variable**:
   - **Name**: Variable name (e.g., `STRIPE_SECRET_KEY`)
   - **Value**: Your actual value
   - **Environment**: Select `Production`, `Preview`, and `Development`

> **Important**: After adding environment variables, redeploy your project for changes to take effect.

### 3. Database Setup for Production

#### **Option A: Vercel Postgres (Recommended)**
\`\`\`bash
# Create a Vercel Postgres database
vercel postgres create pmu-pro-db

# Get the connection string and add to environment variables
DATABASE_URL="postgres://..."
\`\`\`

#### **Option B: External Database (PlanetScale, Supabase, etc.)**
\`\`\`bash
# Use your external database connection string
DATABASE_URL="your-external-database-url"
\`\`\`

### 4. Domain Configuration

1. **Custom Domain** (Optional):
   - Go to **Settings** → **Domains**
   - Add your custom domain
   - Update `NEXTAUTH_URL` and webhook URLs

2. **Stripe Webhook URL**:
   - Update your Stripe webhook endpoint to: `https://your-domain.vercel.app/api/stripe/webhook`

### 5. Build Configuration

Create `vercel.json` in your project root:

\`\`\`json
{
  "framework": "nextjs",
  "buildCommand": "pnpm run build",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "@stripe-publishable-key",
    "NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID": "@stripe-basic-price-id",
    "NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID": "@stripe-premium-price-id"
  }
}
\`\`\`

### 6. Deployment Steps

1. **Connect Repository**:
   \`\`\`bash
   # If not already connected
   vercel --prod
   \`\`\`

2. **Deploy**:
   \`\`\`bash
   # Push to main branch triggers automatic deployment
   git push origin main
   \`\`\`

3. **Run Database Migration**:
   \`\`\`bash
   # After first deployment, run migration
   vercel env pull .env.production
   DATABASE_URL=$(cat .env.production | grep DATABASE_URL | cut -d '=' -f2) npx prisma db push
   \`\`\`

### 7. Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrated and seeded
- [ ] Stripe webhooks configured with production URL
- [ ] Test user registration flow
- [ ] Test payment flow with Stripe test cards
- [ ] Verify AI analysis is working
- [ ] Check all pages load correctly

### 8. Monitoring & Maintenance

1. **Vercel Analytics**: Enable in your dashboard
2. **Error Monitoring**: Check Vercel Function logs
3. **Database Monitoring**: Monitor connection usage
4. **Stripe Dashboard**: Monitor payments and webhooks

### 9. Going Live

When ready for production:

1. **Switch Stripe to Live Mode**:
   - Replace test keys with live keys
   - Update webhook endpoints
   - Test with real payment methods

2. **Domain & SSL**:
   - Configure custom domain
   - SSL is automatic with Vercel

3. **Monitoring**:
   - Set up uptime monitoring
   - Configure error alerts

## 🆘 Troubleshooting

### Common Issues:

**Build Failure - Environment Variables**:
- Ensure all required variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)

**Database Connection Issues**:
- Verify DATABASE_URL format
- Check database is accessible from Vercel's region
- Ensure connection pool limits are configured

**Stripe Webhooks Not Working**:
- Verify webhook URL is correct
- Check webhook secret matches
- Monitor webhook logs in Stripe dashboard

### Support Resources:

- **Vercel Docs**: https://vercel.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment

Your PMU Pro application is production-ready! 🎉
