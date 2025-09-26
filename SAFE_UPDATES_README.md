# Safe Updates & Data Persistence

This document outlines the safety measures implemented to prevent data loss during application updates and deployments.

## Overview

Our application uses a comprehensive approach to ensure zero data loss during updates:

- **Safe Database Migrations**: Expand → Backfill → Switch → Contract pattern
- **File Storage**: Vercel Blob for persistent file storage
- **API Versioning**: Backward-compatible API changes
- **Feature Flags**: Gradual feature rollouts
- **CI/CD Checks**: Automated safety validations
- **Backup Strategy**: Multiple backup layers with PITR

## Key Components

### 1. Environment Configuration

Environment variables are separated by environment:

- **Development**: `.env.local`
- **Staging**: `.env.staging`
- **Production**: `.env.production`

Required variables:
```bash
DATABASE_URL=postgres://...
BLOB_READ_WRITE_TOKEN=...
NEXT_PUBLIC_BLOB_BASE_URL=...
FEATURE_FLAGS_JSON={}
```

### 2. Database Schema Management

- **Schema Versioning**: Tracks compatibility between app and database
- **Safe Migrations**: Non-destructive changes only
- **Meta Table**: Stores schema version and configuration

### 3. File Storage

- **Vercel Blob**: All user files stored in Vercel Blob
- **Database URLs Only**: Only file URLs stored in database
- **Automatic Replication**: Vercel Blob provides built-in redundancy

### 4. API Versioning

- **Stable v1 API**: Current stable API
- **Future v2 API**: New features in separate version
- **Backward Compatibility**: Old versions remain functional

### 5. Feature Flags

- **Gradual Rollouts**: Features can be enabled for subsets of users
- **Safe Testing**: Test new features without affecting all users
- **Quick Rollback**: Disable features instantly if issues arise

## Safety Measures

### CI/CD Checks

Automated checks prevent:
- SQLite usage in production
- Destructive seeding in production
- Unsafe migrations without proper tags
- Missing required environment variables

### Migration Safety

- **Expand Phase**: Add new columns/tables (non-breaking)
- **Backfill Phase**: Populate new data
- **Switch Phase**: Deploy code using new schema
- **Contract Phase**: Remove old columns (separate release)

### Backup Strategy

- **Daily Backups**: Automated daily backups
- **PITR**: Point-in-time recovery for last 7 days
- **Multiple Providers**: Redundant backup storage
- **Regular Testing**: Backup restoration testing

## Usage Guidelines

### For Developers

1. **Always test migrations on staging first**
2. **Use feature flags for new features**
3. **Follow the migration runbook**
4. **Never delete data directly**
5. **Use Vercel Blob for file uploads**

### For DevOps

1. **Monitor health endpoints**
2. **Verify backups regularly**
3. **Test restore procedures**
4. **Monitor schema compatibility**
5. **Review CI/CD checks**

### For Product

1. **Plan feature rollouts with flags**
2. **Coordinate with engineering on migrations**
3. **Test features in staging**
4. **Monitor user feedback during rollouts**

## Monitoring

### Health Check Endpoint

Monitor application health at: `GET /api/health`

Response includes:
- Database connectivity
- Schema version compatibility
- Feature flag status
- Performance metrics

### Key Metrics

- Database connection latency
- Schema version compatibility
- Feature flag status
- Error rates
- Response times

## Emergency Procedures

### Data Loss Prevention

1. **Stop application immediately**
2. **Assess the scope of the issue**
3. **Follow restore runbook**
4. **Notify stakeholders**
5. **Document the incident**

### Rollback Procedures

1. **Redeploy previous version**
2. **Restore database if needed**
3. **Verify functionality**
4. **Monitor for issues**
5. **Plan fix for next release**

## Best Practices

### Development

- Write idempotent migrations
- Use transactions for complex operations
- Test all changes on staging
- Document all modifications
- Use feature flags for new features

### Deployment

- Deploy during low-traffic periods
- Monitor application during deployment
- Have rollback plan ready
- Notify team of changes
- Verify functionality after deployment

### Maintenance

- Regular backup testing
- Monitor database performance
- Review access logs
- Update dependencies regularly
- Document all changes

## Troubleshooting

### Common Issues

1. **Schema Version Mismatch**
   - Check current schema version
   - Update APP_SCHEMA_VERSION if needed
   - Redeploy application

2. **Migration Failures**
   - Check migration file syntax
   - Verify database permissions
   - Review migration logs

3. **File Upload Issues**
   - Check BLOB_READ_WRITE_TOKEN
   - Verify Vercel Blob configuration
   - Check file size limits

### Getting Help

- **Documentation**: Check runbooks and guides
- **Team**: Contact development team
- **Support**: Database provider support
- **Emergency**: On-call engineer

## Related Documentation

- [Migration Runbook](./RUNBOOK_MIGRATIONS.md)
- [Restore Runbook](./RUNBOOK_RESTORE.md)
- [Feature Flags Guide](./docs/feature-flags.md)
- [Backup Strategy](./docs/backup-strategy.md)
- [Monitoring Setup](./docs/monitoring.md)

## Updates

This document is updated whenever new safety measures are implemented. Last updated: $(date)

For questions or suggestions, contact the development team.
