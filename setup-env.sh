#!/bin/bash

# Create .env.local file for PMU Pro Marketing Connections

echo "Creating .env.local file..."

cat > .env.local << 'EOF'
# SECURITY: All sensitive values must be set as environment variables
# This file is for development only - never commit real secrets

# Database
DATABASE_URL=your_database_url_here

# Google Ads API
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/oauth/google/callback
GOOGLE_DEVELOPER_TOKEN=your_google_developer_token_here
GOOGLE_LOGIN_CUSTOMER_ID=your_google_customer_id_here

# Meta (optional for now)
META_APP_ID=your_meta_app_id_here
META_APP_SECRET=your_meta_app_secret_here
META_REDIRECT_URI=http://localhost:3001/api/oauth/meta/callback

# Security (generate a new encryption key)
ENCRYPTION_KEY=your_encryption_key_here

# Facebook Login
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
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
echo "1. Replace ALL placeholder values with your actual API keys and secrets"
echo "2. Generate a new encryption key for production"
echo "3. Set up your database connection"
echo "4. Configure Stripe with your live keys"
echo "5. Restart your dev server: pnpm dev"
echo ""
echo "⚠️  SECURITY WARNING:"
echo "   - Never commit real secrets to version control"
echo "   - Use environment variables for all sensitive data"
echo "   - Generate new encryption keys for production"
echo "   - Use different keys for development and production"

