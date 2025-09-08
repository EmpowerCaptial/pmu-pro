#!/bin/bash

# Create .env.local file for PMU Pro Marketing Connections

echo "Creating .env.local file..."

cat > .env.local << 'EOF'
# Database
NEON_DATABASE_URL=postgresql://neondb_owner:npg_GkIxgEB2sQO3@ep-muddy-sound-aepxhw40-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Google Ads API
GOOGLE_CLIENT_ID=606121029806-tof1eusstl85tkgkahkaj4bpcotho08k.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/oauth/google/callback
GOOGLE_DEVELOPER_TOKEN=-3FDDbbgsL7IdVqxE3fZgg
GOOGLE_LOGIN_CUSTOMER_ID=1234567890

# Meta (optional for now)
META_APP_ID=4098569527125029
META_APP_SECRET=your_meta_app_secret_here
META_REDIRECT_URI=http://localhost:3001/api/oauth/meta/callback

# Security (generated encryption key)
ENCRYPTION_KEY=B+KbT4SacEizG46Z8R4ReMa9MBDwsjyZqYaLjQD73nU=

# Facebook Login
NEXT_PUBLIC_FACEBOOK_APP_ID=4098569527125029
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Stripe (replace with your actual keys)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLIC_KEY=your_stripe_public_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
EOF

echo "✅ .env.local file created!"
echo ""
echo "📝 Next steps:"
echo "1. Get your Google Client Secret from Google Cloud Console"
echo "2. Replace 'your_google_client_secret_here' with the actual secret"
echo "3. Restart your dev server: pnpm dev"
echo ""
echo "🔗 Google Cloud Console: https://console.developers.google.com/"
echo "   Look for OAuth 2.0 Client ID: 606121029806-tof1eusstl85tkgkahkaj4bpcotho08k.apps.googleusercontent.com"

