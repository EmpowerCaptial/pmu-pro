#!/bin/bash

# 🏦 PMU Pro Stripe Environment Setup Script
# This script helps you configure Stripe environment variables

echo "🏦 PMU Pro Stripe Connect Setup"
echo "================================"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "📁 .env.local file found. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
else
    echo "📁 Creating new .env.local file"
fi

echo ""
echo "🔑 Please enter your Stripe configuration details:"
echo ""

# Get Stripe keys
read -p "Enter your Stripe SECRET KEY (starts with sk_live_ or sk_test_): " STRIPE_SECRET_KEY
read -p "Enter your Stripe PUBLISHABLE KEY (starts with pk_live_ or pk_test_): " STRIPE_PUBLISHABLE_KEY

# Get domain
read -p "Enter your production domain (e.g., https://yourdomain.com): " BASE_URL

# Get other required variables
read -p "Enter your NEXTAUTH_SECRET (or press Enter to generate): " NEXTAUTH_SECRET

# Generate NEXTAUTH_SECRET if not provided
if [ -z "$NEXTAUTH_SECRET" ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "🔐 Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
fi

echo ""
echo "📝 Creating .env.local file..."

# Create .env.local file
cat > .env.local << EOF
# Stripe Configuration
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY

# Application Configuration
NEXT_PUBLIC_BASE_URL=$BASE_URL
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=$BASE_URL

# Database (update with your production database URL)
# DATABASE_URL=your-production-database-url

# Stripe Webhook Secret (add after configuring webhooks)
# STRIPE_WEBHOOK_SECRET=whsec_...
EOF

echo ""
echo "✅ .env.local file created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure Stripe Connect in your Stripe dashboard"
echo "2. Set up webhooks and get webhook secret"
echo "3. Add STRIPE_WEBHOOK_SECRET to .env.local"
echo "4. Test the integration"
echo ""
echo "📚 See STRIPE_PRODUCTION_SETUP.md for detailed instructions"
echo ""
echo "🔒 Security reminder: Never commit .env.local to git!"
echo ""
