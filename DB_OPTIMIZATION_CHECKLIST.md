# Database Index Optimization - Deployment Checklist

## Pre-Deployment

### Development Environment

- [ ] Review migration file: `src/migrations/1769500000000-OptimizeClaimIndexes.ts`
- [ ] Verify entity decorators are updated
- [ ] Ensure database has test data (`npm run seed` if needed)
- [ ] Run baseline benchmark: `npm run benchmark:indexes`
- [ ] Note the baseline benchmark filename: `_______________________`
- [ ] Apply migration: `npm run migration:run`
- [ ] Run post-optimization benchmark: `npm run benchmark:indexes`
- [ ] Note the post-optimization filename: `_______________________`
- [ ] Compare results: `npm run benchmark:compare [before] [after]`
- [ ] Verify improvements (target: 90% faster queries)
- [ ] Test application functionality with new indexes
- [ ] Check for any query regressions

### Code Review

- [ ] Review migration SQL statements
- [ ] Verify index names follow naming convention
- [ ] Confirm rollback (down) migration is correct
- [ ] Check entity decorators match migration
- [ ] Review benchmark script logic
- [ ] Verify documentation is complete

### Testing

- [ ] Unit tests pass: `npm test`
- [ ] Integration tests pass: `npm run test:e2e`
- [ ] Manual testing of claim queries
- [ ] Manual testing of leaderboard queries
- [ ] Manual testing of stake queries
- [ ] Manual testing of dispute queries
- [ ] Verify no N+1 query issues
- [ ] Check application logs for errors

## Staging Deployment

### Pre-Deployment

- [ ] Backup staging database
- [ ] Document current query performance metrics
- [ ] Verify staging database has representative data volume
- [ ] Schedule deployment during low-traffic window

### Deployment

- [ ] Deploy code to staging
- [ ] Run baseline benchmark on staging
- [ ] Apply migration: `npm run migration:run`
- [ ] Run post-optimization benchmark
- [ ] Compare results
- [ ] Monitor database CPU/memory usage
- [ ] Check for slow query logs
- [ ] Verify index usage statistics

### Post-Deployment

- [ ] Test all major user flows
- [ ] Monitor application performance for 24 hours
- [ ] Check error logs for database issues
- [ ] Verify no query timeouts
- [ ] Confirm index usage with `pg_stat_user_indexes`
- [ ] Document staging results

## Production Deployment

### Pre-Deployment Planning

- [ ] Review staging results
- [ ] Get approval from team lead
- [ ] Schedule deployment during maintenance window
- [ ] Notify stakeholders of deployment
- [ ] Prepare rollback plan
- [ ] Backup production database
- [ ] Document current production metrics

### Deployment Day

#### Before Migration

- [ ] Verify backup is complete
- [ ] Run baseline benchmark (if safe)
- [ ] Check current database load
- [ ] Verify database disk space (indexes need space)
- [ ] Confirm rollback procedure

#### During Migration

- [ ] Deploy application code
- [ ] Apply migration: `npm run migration:run`
- [ ] Monitor migration progress
- [ ] Check for errors in migration logs
- [ ] Verify all indexes created successfully

#### After Migration

- [ ] Run post-optimization benchmark
- [ ] Compare before/after results
- [ ] Monitor database metrics:
  - [ ] CPU usage
  - [ ] Memory usage
  - [ ] Disk I/O
  - [ ] Query execution time
- [ ] Check application logs
- [ ] Verify user-facing features work correctly
- [ ] Monitor for 1 hour minimum

### Post-Deployment Monitoring (First 24 Hours)

- [ ] Hour 1: Check metrics every 15 minutes
- [ ] Hour 2-4: Check metrics every 30 minutes
- [ ] Hour 4-24: Check metrics every 2 hours
- [ ] Monitor slow query logs
- [ ] Check index usage statistics
- [ ] Verify no increase in error rates
- [ ] Confirm query performance improvements
- [ ] Document any issues

### Post-Deployment Monitoring (First Week)

- [ ] Day 1: Detailed monitoring
- [ ] Day 2-7: Daily metrics review
- [ ] Weekly performance report
- [ ] Compare with baseline metrics
- [ ] Identify any unexpected patterns
- [ ] Document lessons learned

## Rollback Procedure (If Needed)

### When to Rollback

Rollback if:

- [ ] Query performance degrades
- [ ] Database CPU/memory spikes
- [ ] Application errors increase
- [ ] User-facing features break
- [ ] Migration fails

### Rollback Steps

1. [ ] Stop application traffic (if critical)
2. [ ] Run rollback migration: `npm run migration:revert`
3. [ ] Verify indexes are removed
4. [ ] Restart application
5. [ ] Monitor for 30 minutes
6. [ ] Restore from backup if needed
7. [ ] Document rollback reason
8. [ ] Schedule post-mortem

## Success Criteria

### Performance Metrics

- [ ] Average query time reduced by >50%
- [ ] P95 query time < 50ms
- [ ] P99 query time < 100ms
- [ ] No increase in database CPU usage
- [ ] No increase in database memory usage
- [ ] Index usage statistics show active usage

### Application Metrics

- [ ] No increase in error rates
- [ ] No increase in timeout errors
- [ ] User-facing features respond faster
- [ ] No regression in functionality
- [ ] Positive user feedback

### Database Health

- [ ] All indexes created successfully
- [ ] Index usage > 0 for all new indexes
- [ ] No unused indexes
- [ ] No increase in database size beyond expected
- [ ] No slow query log entries for optimized queries

## Documentation

- [ ] Update deployment notes
- [ ] Document actual performance improvements
- [ ] Update monitoring dashboards
- [ ] Share results with team
- [ ] Update runbooks if needed
- [ ] Archive benchmark results

## Sign-Off

| Role      | Name | Date | Signature |
| --------- | ---- | ---- | --------- |
| Developer |      |      |           |
| Tech Lead |      |      |           |
| DBA       |      |      |           |
| DevOps    |      |      |           |

## Notes

Use this space to document any issues, observations, or deviations from the plan:

```
[Add notes here]
```

## Benchmark Results

### Development

- Before: `_______________________`
- After: `_______________________`
- Improvement: `_______________________`

### Staging

- Before: `_______________________`
- After: `_______________________`
- Improvement: `_______________________`

### Production

- Before: `_______________________`
- After: `_______________________`
- Improvement: `_______________________`

## Contact Information

| Issue Type         | Contact  | Method    |
| ------------------ | -------- | --------- |
| Database Issues    | DBA Team | [contact] |
| Application Issues | Dev Team | [contact] |
| Infrastructure     | DevOps   | [contact] |
| Emergency          | On-Call  | [contact] |
