# PMU Pro - Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (sign up with GitHub)
- Database provider account (recommended: Neon, Supabase, or Vercel Postgres)

## Step 1: GitHub Repository Setup
1. Create new repository at https://github.com/new
2. Name: `pmu-pro` (or your preference)
3. Don't initialize with README
4. Create repository

## Step 2: Connect Local to GitHub
Replace `YOUR_USERNAME` with your actual GitHub username:
```bash
git remote add origin https://github.com/YOUR_USERNAME/pmu-pro.git
git branch -M main
git push -u origin main
```

## Step 3: Database Setup (Choose One)

### Option A: Neon (Recommended - Free)
1. Go to https://neon.tech
2. Sign up/in with GitHub
3. Create new project
4. Copy the connection string (starts with `postgresql://`)

### Option B: Supabase
1. Go to https://supabase.com
2. Create new project
3. Go to Settings > Database
4. Copy the connection string

### Option C: Vercel Postgres
1. In Vercel dashboard, go to Storage
2. Create Postgres database
3. Copy connection string

## Step 4: Vercel Deployment
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. **Before deploying**, add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate random string (use: openssl rand -base64 32)

## Step 5: Database Migration
After first deployment:
1. In Vercel dashboard, go to your project
2. Go to Settings > Functions
3. Run: `npx prisma db push` in the Functions tab
4. Optionally run: `npx prisma db seed` to add sample data

## Custom Domain Setup
1. In Vercel project settings, go to Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel

## Environment Variables Reference
```
DATABASE_URL="postgresql://username:password@hostname:5432/database"
NEXTAUTH_SECRET="your-random-secret-string"
NEXTAUTH_URL="https://your-domain.com"
```
