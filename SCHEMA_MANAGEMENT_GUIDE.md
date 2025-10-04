# 🗄️ Database Schema Management Guide

## 🚨 Critical Issue: Schema Drift Prevention

### What Happened
- **Prisma schema** was updated with `emailNotifications` field
- **Production database** wasn't updated to match
- **Result**: All login attempts returned 500 errors
- **Impact**: Complete authentication failure for all users

## 🛡️ Prevention System

### 1. Schema Validation (REQUIRED)
Before any deployment, run:
```bash
npm run validate-schema
```

This script will:
- ✅ Test database connection
- ✅ Validate all Prisma model fields exist in database
- ✅ Test critical operations (login API)
- ❌ **BLOCK DEPLOYMENT** if schema mismatch detected

### 2. Proper Schema Change Process

#### ❌ NEVER DO THIS:
```bash
# Direct schema changes without validation
vim prisma/schema.prisma
git commit -m "Add field"
git push
```

#### ✅ ALWAYS DO THIS:
```bash
# Step 1: Update schema
vim prisma/schema.prisma

# Step 2: Apply to database
npx prisma db push

# Step 3: Validate schema sync
npm run validate-schema

# Step 4: Generate client
npx prisma generate

# Step 5: Test locally
npm run dev

# Step 6: Commit and deploy
git add .
git commit -m "Add field with schema validation"
git push
```

### 3. Production Database Updates

#### For Vercel Deployments:
1. **Schema changes** must be applied to production database
2. **Prisma client** must be regenerated with correct schema
3. **Validation** must pass before deployment

#### Database Migration Commands:
```bash
# Apply schema changes to production
npx prisma db push --force-reset  # DANGER: Resets data
npx prisma db push                # Safe: Adds new fields

# Generate client for production
npx prisma generate

# Validate before deployment
npm run validate-schema
```

### 4. Emergency Recovery

If schema drift is detected in production:

#### Immediate Fix:
```bash
# 1. Fix schema in code
# 2. Apply to production database
npx prisma db push

# 3. Regenerate client
npx prisma generate

# 4. Deploy immediately
git add .
git commit -m "EMERGENCY: Fix schema drift"
git push
```

#### Prevention:
```bash
# Add to CI/CD pipeline
npm run validate-schema || exit 1
```

## 🔍 Monitoring & Detection

### Schema Drift Indicators:
- ❌ 500 errors on authentication endpoints
- ❌ "Column does not exist" errors
- ❌ Prisma validation errors
- ❌ Database connection issues

### Health Checks:
```bash
# Regular validation
npm run validate-schema

# Health check
npm run health:check

# Database status
npx prisma studio
```

## 📋 Best Practices

### 1. Schema Changes
- ✅ Always use `npx prisma db push` after schema changes
- ✅ Always run `npm run validate-schema` before deployment
- ✅ Always test locally before pushing to production
- ✅ Use descriptive commit messages for schema changes

### 2. Deployment Process
- ✅ Validate schema before build
- ✅ Include schema validation in CI/CD
- ✅ Monitor deployment logs for schema errors
- ✅ Have rollback plan ready

### 3. Emergency Procedures
- ✅ Keep schema validation script ready
- ✅ Know how to apply schema changes to production
- ✅ Have database backup/restore procedures
- ✅ Monitor error logs for schema-related issues

## 🚨 Emergency Contacts & Procedures

### If Schema Drift Detected:
1. **STOP** all deployments immediately
2. **RUN** `npm run validate-schema` to confirm
3. **APPLY** schema fix to production database
4. **REGENERATE** Prisma client
5. **DEPLOY** fix immediately
6. **MONITOR** for 30 minutes after deployment

### Prevention Checklist:
- [ ] Schema validation script exists and works
- [ ] Schema validation runs before every deployment
- [ ] Database backup procedures are in place
- [ ] Emergency rollback plan is documented
- [ ] Team knows how to apply schema changes to production

## 📊 Schema Validation Script

The `scripts/validate-schema-sync.js` script:
- Tests database connection
- Validates all User model fields exist
- Tests critical operations (login API)
- Blocks deployment if schema mismatch detected
- Provides clear error messages and fix instructions

**This script is CRITICAL for preventing schema drift issues.**
