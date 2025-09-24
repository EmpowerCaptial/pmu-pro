# Vercel PostgreSQL Database Setup Guide

## 🎯 Complete Setup Steps

### Step 1: Create PostgreSQL Database in Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select your `pmu-pro` project
3. Click on **Storage** tab
4. Click **Create Database** → **PostgreSQL**
5. Name: `pmu-pro-db`
6. Region: Choose closest to your users (e.g., `iad1` for US East)
7. Click **Create**

### Step 2: Environment Variables (Auto-added by Vercel)
Vercel automatically adds:
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### Step 3: Deploy the Application
```bash
vercel --prod
```

### Step 4: Run Database Setup
```bash
npm run db:setup
```

## 🔧 What This Setup Does

✅ **Creates Database Schema** - All tables from Prisma schema
✅ **Creates Demo User** - `universalbeautystudioacademy@gmail.com`
✅ **Creates Demo Clients** - 3 sample clients for testing
✅ **Sets Up Relationships** - Proper foreign keys and indexes

## 🚀 Production Benefits

- **Real Database** - No more mock data
- **Scalable** - Handles thousands of users
- **Reliable** - Vercel's managed PostgreSQL
- **Secure** - Environment variables for connection strings
- **Persistent** - Data survives deployments

## 📊 Database Schema Includes

- **Users** - Artist accounts and authentication
- **Clients** - Client management and profiles
- **Procedures** - PMU procedure records
- **Appointments** - Scheduling system
- **Services** - Service catalog
- **Analyses** - Skin analysis results
- **Photos** - Before/after photos
- **Documents** - Client documents and forms
- **Consent Forms** - Digital consent management

## 🔍 Verification

After setup, verify by:
1. Going to `/clients` page
2. Should see 3 demo clients
3. No more "Failed to fetch clients" errors
4. All client data persists between page refreshes

## 🆘 Troubleshooting

If you encounter issues:
1. Check Vercel dashboard for database status
2. Verify environment variables are set
3. Check Vercel function logs for errors
4. Run `npm run db:setup` again if needed
