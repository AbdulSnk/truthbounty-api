# Database Index Optimization - Quick Start Guide

## 🎯 Goal

Optimize database performance for claims, stakes, disputes, and leaderboard queries through strategic indexing.

## 📋 Prerequisites

- Database is running and accessible
- Database has some test data (run `npm run seed` if needed)
- TypeORM migrations are configured

## 🚀 Quick Start

### Step 1: Baseline Benchmark (Before Optimization)

```bash
npm run benchmark:indexes
```

This will:

- Run 12 different query patterns
- Measure current performance
- Save results to `benchmark-results/benchmark-[timestamp].json`

**Note the filename** - you'll need it for comparison later.

### Step 2: Apply Index Optimization

```bash
npm run migration:run
```

This applies the migration that adds optimized indexes to:

- `claims` table
- `stake` table
- `stake_event` table
- `disputes` table
- `reward_claims` table

### Step 3: Benchmark After Optimization

```bash
npm run benchmark:indexes
```

This creates a new benchmark file with post-optimization results.

### Step 4: Compare Results

```bash
# List available benchmarks
npm run benchmark:compare

# Compare before and after
npm run benchmark:compare benchmark-BEFORE.json benchmark-AFTER.json
```

Replace `benchmark-BEFORE.json` and `benchmark-AFTER.json` with your actual filenames.

## 📊 Expected Results

You should see improvements like:

```
Overall Performance:
Total Execution Time: 500ms → 50ms
  🟢 -450ms (-90%)

Average Execution Time: 41.67ms → 4.17ms
  🟢 -37.5ms (-90%)
```

## 🔍 What Was Optimized?

### Claims Table

- Index on `finalized` for filtering
- Index on `confidenceScore` for leaderboards
- Index on `resolvedVerdict` for outcome queries

### Stake Table

- Index on `claimId` for claim lookups
- Index on `walletAddress` for wallet queries
- Index on `updatedAt` for recent activity

### Stake Event Table

- Indexes on `claimId`, `walletAddress`, `timestamp`, `blockNumber`
- Composite index on `(claimId, walletAddress)` for combined queries

### Disputes Table

- Indexes on `claimId`, `status`, `createdAt`
- Composite index on `(claimId, status)`

### Reward Claims Table

- Composite index on `(walletAddress, blockTimestamp)`
- Index on `amount` for leaderboard queries

## 📈 Monitoring Performance

### Check Index Usage

```sql
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE tablename IN ('claims', 'stake', 'stake_event', 'disputes', 'reward_claims')
ORDER BY idx_scan DESC;
```

### Find Slow Queries

```sql
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%claims%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## 🔄 Rollback (If Needed)

If you need to remove the indexes:

```bash
npm run migration:revert
```

## 📚 Documentation

- **Detailed Guide:** [docs/DB_INDEX_OPTIMIZATION.md](docs/DB_INDEX_OPTIMIZATION.md)
- **Scripts README:** [scripts/README.md](scripts/README.md)
- **Migration File:** [src/migrations/1769500000000-OptimizeClaimIndexes.ts](src/migrations/1769500000000-OptimizeClaimIndexes.ts)

## ✅ Acceptance Criteria

- [x] Query time improved (target: 90% reduction)
- [x] Index migration included
- [x] Benchmarks documented
- [x] Before/after comparison available
- [x] Rollback capability included

## 🎉 Success Indicators

- ✅ Average query time < 10ms
- ✅ Leaderboard queries < 15ms
- ✅ No full table scans on indexed columns
- ✅ Index usage statistics show active usage

## 🆘 Troubleshooting

### Benchmark Script Fails

**Issue:** Database connection error

**Solution:** Check `.env` file and ensure database is running

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### No Performance Improvement

**Issue:** Indexes not being used

**Solution:** Check query plans

```sql
EXPLAIN ANALYZE SELECT * FROM claims WHERE finalized = true;
```

Look for "Index Scan" instead of "Seq Scan"

### Migration Fails

**Issue:** Index already exists

**Solution:** Check existing indexes

```sql
SELECT indexname FROM pg_indexes
WHERE tablename IN ('claims', 'stake', 'stake_event', 'disputes', 'reward_claims');
```

## 📞 Support

For issues or questions:

1. Check the detailed documentation in `docs/DB_INDEX_OPTIMIZATION.md`
2. Review query execution plans with `EXPLAIN ANALYZE`
3. Check database logs for errors
