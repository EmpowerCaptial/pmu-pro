#!/bin/bash

# Quick automated testing command
# Usage: ./scripts/quick-test.sh

echo "🚀 Quick PMU Pro API Test"
echo "========================="

# Test the API endpoint
echo "📡 Testing API endpoint..."
response=$(curl -s -w "\n%{http_code}" "https://thepmuguide.com/api/clients")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

echo "Status: $http_code"
echo "Response: $body"

if [ "$http_code" = "401" ]; then
    echo "✅ API is working! (401 = expected without auth)"
elif [ "$http_code" = "200" ]; then
    echo "✅ API is working! (200 = success with data)"
else
    echo "❌ API issue detected"
    echo "🔧 Running automated fix cycle..."
    node scripts/auto-test-api.js
fi
