# Database Restore Runbook

This runbook provides step-by-step instructions for restoring the database from backups in case of data loss or corruption.

## Overview

We maintain multiple backup strategies:
- **Automated Backups**: Daily automated backups with 30-day retention
- **Point-in-Time Recovery (PITR)**: Available for last 7 days
- **Manual Backups**: Before major deployments or changes

## Pre-Restore Checklist

- [ ] Identify the issue and root cause
- [ ] Determine restore point (timestamp or backup ID)
- [ ] Notify stakeholders of downtime
- [ ] Prepare rollback plan
- [ ] Document the incident

## Restore Scenarios

### Scenario 1: Complete Database Failure

**Symptoms**: Database is completely inaccessible

**Steps**:

1. **Stop Application**
   ```bash
   # If using Vercel, redeploy previous version
   vercel --prod --force
   ```

2. **Contact Database Provider**
   - **Supabase**: Contact support for PITR
   - **Neon**: Use console for backup restoration
   - **RDS**: Use AWS console for snapshot restoration

3. **Restore Database**
   ```bash
   # Example for Neon
   # 1. Go to Neon Console
   # 2. Select your project
   # 3. Go to "Backups" tab
   # 4. Select restore point
   # 5. Create new database from backup
   ```

4. **Update Connection String**
   ```bash
   # Update DATABASE_URL in Vercel environment variables
   # New connection string will be provided by database provider
   ```

5. **Verify Restoration**
   ```bash
   # Test database connectivity
   npx prisma db pull
   npx prisma generate
   ```

6. **Restart Application**
   ```bash
   # Redeploy application
   vercel --prod
   ```

### Scenario 2: Partial Data Corruption

**Symptoms**: Some data is missing or corrupted, but database is accessible

**Steps**:

1. **Identify Affected Data**
   ```sql
   -- Check for missing or corrupted records
   SELECT COUNT(*) FROM users WHERE created_at > '2024-01-01';
   SELECT COUNT(*) FROM clients WHERE user_id IS NULL;
   ```

2. **Create Backup of Current State**
   ```bash
   # Export current database state
   pg_dump $DATABASE_URL > backup_before_restore.sql
   ```

3. **Restore Specific Tables**
   ```bash
   # Restore only affected tables from backup
   psql $DATABASE_URL -c "DROP TABLE IF EXISTS affected_table CASCADE;"
   psql $DATABASE_URL -f backup_affected_table.sql
   ```

4. **Verify Data Integrity**
   ```sql
   -- Check data consistency
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM clients;
   -- Verify foreign key relationships
   ```

5. **Test Application**
   ```bash
   # Test critical functionality
   curl https://your-domain.com/api/health
   ```

### Scenario 3: Accidental Data Deletion

**Symptoms**: Specific records or tables were accidentally deleted

**Steps**:

1. **Stop Application** (if deletion is ongoing)
   ```bash
   # Prevent further data loss
   vercel --prod --force
   ```

2. **Identify Deletion Scope**
   ```sql
   -- Check what was deleted
   SELECT * FROM audit_log WHERE action = 'DELETE' AND created_at > '2024-01-01';
   ```

3. **Restore from PITR**
   ```bash
   # Use Point-in-Time Recovery to restore to before deletion
   # This varies by database provider
   ```

4. **Selective Data Recovery**
   ```sql
   -- If only specific records were deleted, restore them
   INSERT INTO users (id, name, email, ...)
   SELECT id, name, email, ...
   FROM backup_users
   WHERE id IN ('deleted_user_id_1', 'deleted_user_id_2');
   ```

5. **Verify Recovery**
   ```sql
   -- Check that deleted data is restored
   SELECT * FROM users WHERE id = 'deleted_user_id_1';
   ```

## Database Provider Specific Instructions

### Supabase

1. **Access Supabase Dashboard**
2. **Go to Settings → Database**
3. **Click "Restore from backup"**
4. **Select restore point**
5. **Choose restore method**:
   - **Full restore**: Complete database replacement
   - **Selective restore**: Restore specific tables

### Neon

1. **Access Neon Console**
2. **Select your project**
3. **Go to "Backups" tab**
4. **Click "Restore" on desired backup**
5. **Choose restore options**:
   - **New database**: Create new database from backup
   - **Replace current**: Overwrite current database

### AWS RDS

1. **Access AWS RDS Console**
2. **Go to "Snapshots"**
3. **Select snapshot to restore**
4. **Click "Restore snapshot"**
5. **Configure new instance**
6. **Update connection string**

## Post-Restore Verification

### 1. Database Connectivity
```bash
# Test database connection
npx prisma db pull
npx prisma generate
```

### 2. Application Health
```bash
# Check health endpoint
curl https://your-domain.com/api/health

# Expected response:
{
  "ok": true,
  "database": {
    "connected": true,
    "latency": "15ms"
  }
}
```

### 3. Data Integrity
```sql
-- Check critical tables
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM clients;
SELECT COUNT(*) FROM appointments;

-- Verify relationships
SELECT u.id, COUNT(c.id) as client_count
FROM users u
LEFT JOIN clients c ON u.id = c.user_id
GROUP BY u.id
HAVING COUNT(c.id) = 0;
```

### 4. Application Functionality
- [ ] User login works
- [ ] Data displays correctly
- [ ] Forms submit successfully
- [ ] File uploads work
- [ ] Payment processing works

## Monitoring After Restore

### Key Metrics to Monitor

1. **Database Performance**
   - Connection latency
   - Query performance
   - Error rates

2. **Application Performance**
   - Response times
   - Error rates
   - User experience

3. **Data Consistency**
   - Record counts
   - Foreign key integrity
   - Business logic validation

### Alerting

Set up alerts for:
- Database connection failures
- High error rates
- Data inconsistency
- Performance degradation

## Prevention Measures

### 1. Regular Backups
- Automated daily backups
- Weekly full backups
- Pre-deployment backups

### 2. Testing
- Regular restore testing
- Disaster recovery drills
- Backup verification

### 3. Monitoring
- Real-time database monitoring
- Application health checks
- Automated alerting

### 4. Access Control
- Principle of least privilege
- Audit logging
- Regular access reviews

## Emergency Contacts

- **Primary**: Development Team Lead
- **Secondary**: DevOps Engineer
- **Database Provider**: Support contact
- **Management**: CTO/Engineering Manager

## Related Documentation

- [Migration Runbook](./RUNBOOK_MIGRATIONS.md)
- [Backup Strategy](./docs/backup-strategy.md)
- [Monitoring Setup](./docs/monitoring.md)
- [Incident Response](./docs/incident-response.md)

## Recovery Time Objectives (RTO)

- **Critical Systems**: 1 hour
- **Standard Systems**: 4 hours
- **Non-Critical Systems**: 24 hours

## Recovery Point Objectives (RPO)

- **Critical Data**: 15 minutes
- **Standard Data**: 1 hour
- **Non-Critical Data**: 24 hours
