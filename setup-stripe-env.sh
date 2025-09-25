#!/bin/bash

echo "🔧 PMU Pro Stripe Connect Setup"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    touch .env.local
fi

echo "Please provide your Stripe keys:"
echo ""

# Get Stripe Secret Key
read -p "Enter your Stripe Secret Key (sk_test_... or sk_live_...): " STRIPE_SECRET_KEY

# Get Stripe Publishable Key
read -p "Enter your Stripe Publishable Key (pk_test_... or pk_live_...): " STRIPE_PUBLISHABLE_KEY

# Get Base URL
read -p "Enter your base URL (e.g., https://thepmuguide.com or http://localhost:3000): " BASE_URL

echo ""
echo "Updating .env.local file..."

# Create/update .env.local
cat > .env.local << EOF
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="${BASE_URL}"

# Stripe Configuration
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}"
STRIPE_PUBLISHABLE_KEY="${STRIPE_PUBLISHABLE_KEY}"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${STRIPE_PUBLISHABLE_KEY}"
NEXT_PUBLIC_BASE_URL="${BASE_URL}"
EOF

echo ""
echo "✅ Environment variables updated!"
echo ""
echo "Next steps:"
echo "1. Restart your development server (npm run dev)"
echo "2. Go to https://dashboard.stripe.com and enable Stripe Connect"
echo "3. Test the integration at /stripe-connect"
echo ""
echo "⚠️  Important: Never commit .env.local to git!"
echo ""