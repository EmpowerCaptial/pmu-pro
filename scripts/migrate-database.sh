#!/bin/bash

# PMU Pro Database Migration Script
# This script helps you migrate your database to include professional authentication

echo "🚀 PMU Pro Database Migration"
echo "==============================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "Please set your DATABASE_URL in .env.local first"
    exit 1
fi

echo "📋 This will update your database schema to include:"
echo "   - Professional authentication fields"
echo "   - License verification system"
echo "   - Stripe subscription integration"
echo "   - Enhanced user management"
echo ""

read -p "Continue with migration? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled"
    exit 0
fi

echo "🔄 Running database migration..."

# Option 1: Using Prisma (recommended)
if command -v npx &> /dev/null; then
    echo "📦 Using Prisma to migrate..."
    npx prisma db push
    if [ $? -eq 0 ]; then
        echo "✅ Prisma migration completed successfully"
    else
        echo "❌ Prisma migration failed"
        exit 1
    fi
else
    echo "⚠️  Prisma not available, you can run the SQL migration manually"
fi

# Option 2: Direct SQL migration (fallback)
echo ""
echo "🔧 Alternative: Run SQL migration manually"
echo "Execute this file against your database:"
echo "📁 scripts/003-migrate-users-table.sql"

echo ""
echo "🎉 Migration process completed!"
echo ""
echo "📝 Next steps:"
echo "1. Update your authentication system to use new User fields"
echo "2. Implement license verification workflow"
echo "3. Test Stripe subscription integration"
echo "4. Update user registration forms"
echo ""
echo "📚 See STRIPE_SETUP.md for Stripe configuration"
