# Quick Database Setup - Create Service Assignments Table

## 🎯 You Need To Do This ONCE (5 Minutes)

The `service_assignments` table needs to be created in your production database.

---

## Option 1: Neon Dashboard (Easiest - 2 minutes)

### Step 1: Go to Neon Dashboard
1. Visit: https://console.neon.tech
2. Log in
3. Find your project: `pmu-pro` or `thepmuguide`

### Step 2: Open SQL Editor
1. Click on your database
2. Click "SQL Editor" tab
3. Click "New Query"

### Step 3: Run This SQL
Copy and paste this entire block:

```sql
CREATE TABLE IF NOT EXISTS service_assignments (
    id TEXT PRIMARY KEY,
    "serviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    assigned BOOLEAN DEFAULT true,
    "assignedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "service_assignments_serviceId_userId_key" UNIQUE ("serviceId", "userId")
);

CREATE INDEX IF NOT EXISTS "service_assignments_userId_idx" ON service_assignments("userId");
CREATE INDEX IF NOT EXISTS "service_assignments_serviceId_idx" ON service_assignments("serviceId");
CREATE INDEX IF NOT EXISTS "service_assignments_assignedBy_idx" ON service_assignments("assignedBy");

ALTER TABLE service_assignments
ADD CONSTRAINT IF NOT EXISTS "service_assignments_serviceId_fkey" 
FOREIGN KEY ("serviceId") REFERENCES services(id) ON DELETE CASCADE;

ALTER TABLE service_assignments
ADD CONSTRAINT IF NOT EXISTS "service_assignments_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE service_assignments
ADD CONSTRAINT IF NOT EXISTS "service_assignments_assignedBy_fkey" 
FOREIGN KEY ("assignedBy") REFERENCES users(id) ON DELETE CASCADE;
```

### Step 4: Click "Run"

You'll see: `Service assignments table created successfully!`

---

## Option 2: From Terminal (If you have production DATABASE_URL)

```bash
# Set production database URL
export DATABASE_URL="postgresql://your-production-url"

# Push schema
npx prisma db push
```

---

## Option 3: Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Find your project: `pmu-pro`
3. Go to: Storage → Your Postgres database
4. Click: "Query" or "Data" tab
5. Run the SQL from Option 1

---

## After Creating The Table:

1. ✅ Visit: `https://thepmuguide.com/migrate-to-database`
2. ✅ Click: "Start Migration"
3. ✅ Your 7 assignments will be saved to database
4. ✅ Jenny will see services!

---

## For Future Reference:

**New deployments will automatically include this table** because the Prisma schema is updated. This is a ONE-TIME manual step only for your existing production database.

---

**Which option do you want to use?** I recommend Option 1 (Neon Dashboard) - it's the fastest and most reliable.

