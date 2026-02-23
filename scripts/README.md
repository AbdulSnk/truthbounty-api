# Database Benchmark Scripts

This directory contains scripts for benchmarking and comparing database query performance.

## Scripts

### benchmark-indexes.ts

Runs a comprehensive benchmark of database queries to measure performance.

**Usage:**

```bash
npm run benchmark:indexes
```

**What it does:**

- Tests 12 different query patterns
- Measures execution time for each query
- Captures EXPLAIN ANALYZE plans (PostgreSQL)
- Saves results to `benchmark-results/` directory
- Prints summary report

**When to run:**

- Before applying index optimization migration (baseline)
- After applying migration (comparison)
- Periodically to monitor performance trends

### compare-benchmarks.ts

Compares two benchmark results to show performance improvements.

**Usage:**

```bash
# List available benchmarks
npm run benchmark:compare

# Compare two specific benchmarks
npm run benchmark:compare benchmark-2024-01-01.json benchmark-2024-01-02.json
```

**What it does:**

- Loads two benchmark result files
- Calculates performance differences
- Shows query-by-query comparison
- Highlights top improvements
- Provides overall performance rating

## Workflow

### 1. Establish Baseline

Before applying the index optimization migration:

```bash
# Run benchmark to establish baseline
npm run benchmark:indexes
```

This creates a file like `benchmark-results/benchmark-2024-01-15T10-30-00-000Z.json`

### 2. Apply Migration

```bash
npm run migration:run
```

### 3. Measure Improvements

```bash
# Run benchmark again
npm run benchmark:indexes
```

This creates a new file like `benchmark-results/benchmark-2024-01-15T10-35-00-000Z.json`

### 4. Compare Results

```bash
npm run benchmark:compare benchmark-2024-01-15T10-30-00-000Z.json benchmark-2024-01-15T10-35-00-000Z.json
```

## Benchmark Results Directory

Results are saved to `benchmark-results/` with timestamps:

```
benchmark-results/
├── benchmark-2024-01-15T10-30-00-000Z.json  (before)
├── benchmark-2024-01-15T10-35-00-000Z.json  (after)
└── ...
```

Each file contains:

- Timestamp
- Individual query results
- Execution times
- Row counts
- Query execution plans (if available)
- Summary statistics

## Interpreting Results

### Execution Time

- 🟢 < 10ms: Excellent
- 🟡 10-50ms: Good
- 🔴 > 50ms: Needs optimization

### Performance Improvement

- 🌟🌟🌟 > 50% faster: Excellent
- 🌟🌟 25-50% faster: Great
- 🌟 10-25% faster: Good
- ✅ 0-10% faster: Improved
- ⚠️ ±10%: Neutral
- ❌ Slower: Degraded

## Queries Tested

1. Find finalized claims
2. Find high confidence claims (leaderboard)
3. Find stakes for specific claim
4. Find stakes by wallet address
5. Aggregate stakes by claim
6. Find recent stake events
7. Find stake events for claim
8. Find disputes for claim
9. Find open disputes
10. Top reward earners leaderboard
11. Recent rewards by wallet
12. Claims with stake aggregation (complex join)

## Troubleshooting

### Database Connection Issues

Ensure your database is running and `.env` is configured:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### No Results

If queries return no results, seed the database first:

```bash
npm run seed
```

### Permission Errors

The benchmark script needs read access to the database. Ensure your database user has SELECT permissions.

## Related Documentation

- [DB Index Optimization Guide](../docs/DB_INDEX_OPTIMIZATION.md)
- [Migration File](../src/migrations/1769500000000-OptimizeClaimIndexes.ts)
