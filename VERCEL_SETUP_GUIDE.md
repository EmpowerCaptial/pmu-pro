# Vercel Setup Guide for Safe Updates

This guide walks you through setting up the required environment variables and services in Vercel.

## Step 1: Environment Variables

Go to your Vercel project dashboard → Settings → Environment Variables

### Required Variables

```bash
# Database (already set)
DATABASE_URL=postgres://...

# Vercel Blob Storage (NEW)
BLOB_READ_WRITE_TOKEN=vercel_blob_token_here
NEXT_PUBLIC_BLOB_BASE_URL=https://blob.vercel-storage.com

# Feature Flags (NEW)
FEATURE_FLAGS_JSON={"newGrader": false, "enhancedAnalytics": false}

# App Configuration (update if needed)
NEXT_PUBLIC_APP_URL=https://thepmuguide.com
NEXT_PUBLIC_APP_ENV=production

# Security (already set)
ENCRYPTION_KEY=your_encryption_key_here

# Stripe (already set)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Safety (NEW)
SEED_IN_PROD=false
```

### How to Add Variables

1. Click "Add New" for each variable
2. Enter the **Name** and **Value**
3. Select **Production** environment
4. Click "Save"

## Step 2: Enable Vercel Blob

1. Go to your Vercel project dashboard
2. Click on "Storage" tab
3. Click "Create Database" → "Blob"
4. Name it (e.g., "pmu-pro-files")
5. Copy the `BLOB_READ_WRITE_TOKEN` from the created blob
6. Add it to your environment variables

## Step 3: Database Migration

The Meta table needs to be created in your production database.

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Run the migration
vercel env pull .env.production
npx prisma migrate deploy
```

### Option B: Manual SQL (If CLI doesn't work)

1. Go to your database provider dashboard (Supabase/Neon/RDS)
2. Open the SQL editor
3. Run this SQL:

```sql
-- Create Meta table
CREATE TABLE IF NOT EXISTS "meta" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "meta_pkey" PRIMARY KEY ("key")
);

-- Insert initial schema version
INSERT INTO "meta" ("key", "value") 
VALUES ('schemaVersion', '1')
ON CONFLICT ("key") DO NOTHING;
```

## Step 4: Verify Setup

After setting up the environment variables and running the migration:

1. **Redeploy your application** in Vercel
2. **Test the health endpoint**:
   ```bash
   curl https://thepmuguide.com/api/health
   ```

Expected response:
```json
{
  "ok": true,
  "version": {
    "schema": 1,
    "required": 1,
    "compatible": true
  },
  "database": {
    "connected": true,
    "latency": "15ms"
  }
}
```

## Step 5: Configure Database Backups

### For Supabase
1. Go to Supabase Dashboard → Settings → Database
2. Enable "Point in Time Recovery"
3. Set backup retention to 7 days

### For Neon
1. Go to Neon Console → Settings → Backups
2. Enable "Point in Time Recovery"
3. Set backup retention to 7 days

### For AWS RDS
1. Go to AWS RDS Console → Your Database → Backup & Restore
2. Enable "Automated Backups"
3. Set backup retention to 7 days

## Troubleshooting

### Health Endpoint Returns Error
- Check that DATABASE_URL is correct
- Verify Meta table was created
- Check Vercel function logs

### Blob Storage Not Working
- Verify BLOB_READ_WRITE_TOKEN is correct
- Check that Vercel Blob is enabled
- Test with a simple upload

### Migration Fails
- Check database permissions
- Verify DATABASE_URL format
- Run manual SQL if needed

## Next Steps

After completing this setup:

1. **Test file uploads** to verify Blob storage
2. **Monitor the health endpoint** regularly
3. **Review the runbooks** for future migrations
4. **Set up monitoring alerts** for the health endpoint

## Support

If you encounter issues:
1. Check Vercel function logs
2. Review database provider logs
3. Contact the development team
4. Refer to the runbooks for detailed procedures
