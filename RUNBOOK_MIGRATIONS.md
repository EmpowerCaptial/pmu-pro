# Migration Runbook

This runbook provides step-by-step instructions for safely migrating the database schema without data loss.

## Overview

We use the **Expand → Backfill → Switch → Contract** pattern for all migrations:

1. **Expand**: Add new columns/tables (non-breaking)
2. **Backfill**: Populate new data
3. **Switch**: Deploy code that uses new schema
4. **Contract**: Remove old columns (in later release)

## Pre-Migration Checklist

- [ ] Database backup completed
- [ ] Migration tested on staging environment
- [ ] Rollback plan documented
- [ ] Team notified of maintenance window
- [ ] Monitoring alerts configured

## Step-by-Step Migration Process

### Phase 1: Expand (Non-Breaking Changes)

1. **Create Migration**
   ```bash
   npx prisma migrate dev --name add_new_feature_columns
   ```

2. **Review Migration**
   - Ensure no `DROP`, `TRUNCATE`, or `DELETE` statements
   - Verify all changes are additive only
   - Check that existing data remains intact

3. **Deploy to Staging**
   ```bash
   npx prisma migrate deploy
   ```

4. **Verify Staging**
   - Test all existing functionality
   - Confirm new columns are nullable/defaulted
   - Check application logs for errors

### Phase 2: Backfill (Data Population)

1. **Create Backfill Script**
   ```typescript
   // scripts/backfill-new-feature.ts
   import { PrismaClient } from '@prisma/client';
   
   const prisma = new PrismaClient();
   
   async function backfill() {
     // Idempotent backfill logic
     const users = await prisma.user.findMany({
       where: { newColumn: null }
     });
     
     for (const user of users) {
       await prisma.user.update({
         where: { id: user.id },
         data: { newColumn: 'default-value' }
       });
     }
   }
   ```

2. **Run Backfill on Staging**
   ```bash
   npx tsx scripts/backfill-new-feature.ts
   ```

3. **Verify Backfill**
   - Check data consistency
   - Verify no data corruption
   - Test application functionality

### Phase 3: Switch (Deploy New Code)

1. **Deploy Application Code**
   - Deploy code that uses new schema
   - Ensure backward compatibility
   - Monitor application performance

2. **Verify Deployment**
   - Check health endpoint: `/api/health`
   - Monitor error rates
   - Verify feature functionality

3. **Update Schema Version**
   ```typescript
   // Update APP_SCHEMA_VERSION in lib/schemaVersion.ts
   export const APP_SCHEMA_VERSION = 2; // Increment from previous version
   ```

### Phase 4: Contract (Remove Old Schema)

**⚠️ This phase should be done in a separate release, weeks after Phase 3**

1. **Create Contract Migration**
   ```bash
   npx prisma migrate dev --name remove_old_columns
   ```

2. **Add Contract Tag**
   ```sql
   -- Add this comment to your migration file
   -- contract-phase-ok: Removing old columns after successful migration
   ```

3. **Deploy Contract Migration**
   ```bash
   npx prisma migrate deploy
   ```

## Emergency Rollback

If issues occur during migration:

1. **Stop Application**
   ```bash
   # If using Vercel, redeploy previous version
   vercel --prod --force
   ```

2. **Rollback Database** (if necessary)
   ```bash
   # Restore from backup
   # Contact your database provider for PITR
   ```

3. **Verify Rollback**
   - Check application functionality
   - Verify data integrity
   - Monitor error rates

## Monitoring and Alerts

### Key Metrics to Monitor

- Database connection latency
- Error rates
- Schema version compatibility
- Feature flag status

### Health Check Endpoint

Monitor: `GET /api/health`

Expected response:
```json
{
  "ok": true,
  "version": {
    "schema": 2,
    "required": 2,
    "compatible": true
  },
  "database": {
    "connected": true,
    "latency": "15ms"
  }
}
```

## Common Issues and Solutions

### Issue: Schema Version Mismatch

**Symptoms**: Application shows schema compatibility warnings

**Solution**:
1. Check current schema version in database
2. Update `APP_SCHEMA_VERSION` if needed
3. Redeploy application

### Issue: Migration Fails

**Symptoms**: `prisma migrate deploy` fails

**Solution**:
1. Check migration file syntax
2. Verify database permissions
3. Review migration logs
4. Consider manual migration if needed

### Issue: Data Corruption

**Symptoms**: Application errors, missing data

**Solution**:
1. Stop application immediately
2. Restore from backup
3. Investigate root cause
4. Fix migration script
5. Retry migration

## Best Practices

1. **Always test on staging first**
2. **Keep migrations small and focused**
3. **Use transactions for complex migrations**
4. **Monitor application during deployment**
5. **Have rollback plan ready**
6. **Document all changes**
7. **Use feature flags for gradual rollouts**

## Contact Information

- **Primary**: Development Team
- **Secondary**: DevOps Team
- **Emergency**: On-call Engineer

## Related Documentation

- [Restore Runbook](./RUNBOOK_RESTORE.md)
- [Feature Flags Guide](./docs/feature-flags.md)
- [Database Backup Strategy](./docs/backup-strategy.md)
