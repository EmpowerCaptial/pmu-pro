-- Run this SQL in each Neon database to identify the production one
-- Production database should have:
-- - 5 users (Tyrone, Tierra, Ally, Mya, Jenny)
-- - 8 services
-- - 9 clients
-- - 2 team messages

-- Check 1: Count users (should be 5 in production)
SELECT 
    'User Count' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 5 THEN '✅ LIKELY PRODUCTION'
        WHEN COUNT(*) > 0 THEN '⚠️  Has users but not 5'
        ELSE '❌ No users'
    END as status
FROM "User";

-- Check 2: List user emails (production should have these)
SELECT 
    'User Emails' as check_type,
    email,
    name,
    role
FROM "User"
ORDER BY email;

-- Check 3: Count services (should be 8 in production)
SELECT 
    'Service Count' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 8 THEN '✅ LIKELY PRODUCTION'
        WHEN COUNT(*) > 0 THEN '⚠️  Has services but not 8'
        ELSE '❌ No services'
    END as status
FROM "Service";

-- Check 4: Count clients (should be 9 in production)
SELECT 
    'Client Count' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 9 THEN '✅ LIKELY PRODUCTION'
        WHEN COUNT(*) > 0 THEN '⚠️  Has clients but not 9'
        ELSE '❌ No clients'
    END as status
FROM "Client";

-- Check 5: Check if client_bookings table exists
SELECT 
    'client_bookings Table' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'client_bookings'
        ) THEN '✅ Table exists'
        ELSE '❌ Table missing - THIS IS THE ONE TO FIX'
    END as status;

-- Check 6: Database connection info (if available)
SELECT 
    current_database() as database_name,
    current_user as current_user,
    version() as postgres_version;

