# Database Migration Guide

## 🚨 What Happened

On October 11-12, 2025, we discovered that the application was using **TWO DIFFERENT DATABASES** simultaneously:

### Old Database (Prisma.io - DEPRECATED)
- **URL:** `db.prisma.io:5432`
- **Status:** ❌ No longer in use (archived)
- **Data:** Had 7 services, 9 clients, and original user data
- **Problem:** `.env.local` was pointing here

### Current Database (Neon - PRODUCTION)
- **URL:** `ep-muddy-sound-aepxhw40-pooler.c-2.us-east-2.aws.neon.tech`
- **Status:** ✅ Active production database
- **Data:** Now has all migrated data (5 users, 8 services, 9 clients)
- **Used by:** Vercel production deployment

## ⚠️ The Problem

When local development used `.env.local` with the old Prisma.io database:
- New services and clients created locally were saved to the OLD database
- Production (Vercel) used the NEW Neon database
- This caused data to "disappear" when viewing the live site

## ✅ What We Fixed

1. **Migrated All Data:**
   - ✅ 5 users (Tyrone, Tierra, Ally, Mya, Jenny)
   - ✅ 8 services (all PMU services including Microblading, Powder Brows, etc.)
   - ✅ 9 clients (all client records)
   - ✅ 2 team messages

2. **Updated Local Configuration:**
   - Updated `.env.local` to point to Neon database
   - Backed up old config to `.env.local.backup`

3. **Deleted Old Database Scripts:**
   - Removed 23 scripts that had hardcoded old database URLs
   - These were causing confusion and pulling wrong data

## 🛡️ How to Prevent This in the Future

### 1. Always Use Environment Variables

**❌ NEVER do this:**
```javascript
const dbUrl = "postgres://user:pass@db.prisma.io:5432/postgres"
```

**✅ ALWAYS do this:**
```javascript
const dbUrl = process.env.DATABASE_URL
```

### 2. Verify Database Connection Regularly

Run this command anytime you're unsure:
```bash
node scripts/verify-database-connection.js
```

This script will:
- Show which database you're connected to
- Display data counts
- Warn if you're on the wrong database

### 3. Check Before Making Changes

Before creating services, clients, or other data:
```bash
# Check which database
node scripts/verify-database-connection.js

# Should show:
# ✅ CORRECT: Neon Database (Production)
```

### 4. Use Vercel Environment Variables

For production, ALWAYS use Vercel's environment variables:
```bash
vercel env pull .env.production
```

This ensures you're using the same database as production.

### 5. NPM Script for Safety

We added a pre-dev check to `package.json`:
```json
"scripts": {
  "verify-db": "node scripts/verify-database-connection.js",
  "dev": "npm run verify-db && next dev"
}
```

Now every time you run `npm run dev`, it verifies your database connection first!

## 📊 Current Database Status

### Production Database (Neon)
```
Host: ep-muddy-sound-aepxhw40-pooler.c-2.us-east-2.aws.neon.tech
Database: neondb
Status: ✅ Active

Data Summary:
- Users: 5
- Services: 8
- Clients: 9
- Team Messages: 2
- Appointments: 0
- Deposit Payments: 0
- Commission Transactions: 0
```

### Old Database (Prisma.io)
```
Host: db.prisma.io:5432
Status: ❌ ARCHIVED (Do not use)
Note: Data has been migrated to Neon
```

## 🔐 Environment Variables

### Local Development (`.env.local`)
```bash
DATABASE_URL="postgresql://neondb_owner:npg_...@ep-muddy-sound-aepxhw40-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### Vercel Production
- Managed through Vercel dashboard
- Uses the same Neon database
- Updated: October 11, 2025

## 📝 Checklist for New Features

Before deploying new features that interact with the database:

- [ ] Run `node scripts/verify-database-connection.js`
- [ ] Confirm ✅ Neon Database (Production)
- [ ] Test locally with the correct database
- [ ] Verify data appears on live site after deployment
- [ ] Check Vercel logs if data doesn't appear

## 🆘 Emergency: Data Not Appearing?

If data you created isn't showing up:

1. **Check which database you used:**
   ```bash
   node scripts/verify-database-connection.js
   ```

2. **If on old database:**
   - Update `.env.local` DATABASE_URL to use Neon URL
   - Restart dev server: `npm run dev`

3. **If data is in wrong database:**
   - Contact support with details
   - Data can be migrated (like we did Oct 12, 2025)

## 📞 Support

If you see this message, contact immediately:
```
⚠️  WARNING: Old Prisma.io Database (DEPRECATED)
```

This means you're using the wrong database!

---

**Last Updated:** October 12, 2025  
**Migration Date:** October 12, 2025  
**Current Status:** ✅ All systems operational on Neon database

