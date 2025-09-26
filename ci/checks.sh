#!/bin/bash

# CI/CD Safety Checks
# This script prevents accidental data loss during deployments

set -e

echo "🔍 Running safety checks..."

# Check 1: Prevent SQLite in production
if [[ "$DATABASE_URL" == *"sqlite"* ]] && [[ "$VERCEL_ENV" == "production" ]]; then
  echo "❌ SQLite not allowed in production"
  echo "   DATABASE_URL: $DATABASE_URL"
  exit 1
fi

# Check 2: Prevent seeding in production
if [[ "$SEED_IN_PROD" == "true" ]] && [[ "$VERCEL_ENV" == "production" ]]; then
  echo "❌ Seeding in production is disabled"
  echo "   SEED_IN_PROD: $SEED_IN_PROD"
  exit 1
fi

# Check 3: Check for destructive migrations
if [ -d "prisma/migrations" ]; then
  # Look for dangerous SQL operations
  if grep -RiqE "drop table|truncate table|delete from" prisma/migrations/*; then
    # Check if migration is tagged as contract phase
    if ! grep -Riq "contract-phase-ok" prisma/migrations/*; then
      echo "❌ Destructive migration detected without contract-phase-ok tag"
      echo "   Add 'contract-phase-ok' comment to migration if this is intentional"
      exit 1
    fi
  fi
fi

# Check 4: Ensure DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL environment variable is required"
  exit 1
fi

# Check 5: Validate DATABASE_URL format
if [[ "$DATABASE_URL" != postgres* ]] && [[ "$VERCEL_ENV" == "production" ]]; then
  echo "❌ Invalid DATABASE_URL format for production"
  echo "   Expected: postgres://..."
  echo "   Got: $DATABASE_URL"
  exit 1
fi

# Check 6: Ensure required environment variables are set
required_vars=("DATABASE_URL")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Required environment variable $var is not set"
    exit 1
  fi
done

# Check 7: Validate feature flags JSON format
if [ -n "$FEATURE_FLAGS_JSON" ]; then
  if ! echo "$FEATURE_FLAGS_JSON" | jq . > /dev/null 2>&1; then
    echo "❌ FEATURE_FLAGS_JSON is not valid JSON"
    echo "   Value: $FEATURE_FLAGS_JSON"
    exit 1
  fi
fi

# Check 8: Ensure BLOB_READ_WRITE_TOKEN is set for production
if [[ "$VERCEL_ENV" == "production" ]] && [ -z "$BLOB_READ_WRITE_TOKEN" ]; then
  echo "❌ BLOB_READ_WRITE_TOKEN is required for production"
  exit 1
fi

echo "✅ All safety checks passed"
echo "   Environment: ${VERCEL_ENV:-development}"
echo "   Database: ${DATABASE_URL:0:20}..."
echo "   Feature flags: ${FEATURE_FLAGS_JSON:-none}"
