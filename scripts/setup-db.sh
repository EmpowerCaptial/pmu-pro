#!/bin/bash

# Database setup script for production deployment
echo "Setting up production database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    exit 1
fi

# Run Prisma commands
echo "Generating Prisma client..."
npx prisma generate

echo "Pushing database schema..."
npx prisma db push --force-reset

echo "Seeding database with sample data..."
npx prisma db seed

echo "Database setup complete!"
echo "You can view your database at: https://console.neon.tech"
