#!/bin/bash

echo "🔍 Finding pages with NavBar but no user prop..."
echo "================================================"
echo ""

# Search for NavBar usage without user prop
grep -r "<NavBar" app/ --include="*.tsx" | grep -v "user=" | grep -v "node_modules" | head -20

echo ""
echo "================================================"
echo "✅ Pages that should show logged-in user info"
echo ""

