import { DataSource } from 'typeorm';
import { performance } from 'perf_hooks';

interface BenchmarkResult {
  query: string;
  description: string;
  executionTime: number;
  rowsReturned: number;
  explainPlan?: any;
}

/**
 * Database Index Benchmark Script
 * 
 * This script benchmarks query performance before and after index optimization.
 * Run this script BEFORE applying the migration to get baseline metrics.
 * Then run the migration and execute this script again to compare results.
 */
export class IndexBenchmark {
  constructor(private dataSource: DataSource) {}

  async runBenchmark(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];

    console.log('🚀 Starting Database Index Benchmark...\n');

    // Benchmark 1: Find claims by finalized status
    results.push(await this.benchmarkQuery(
      'Find finalized claims',
      `SELECT * FROM claims WHERE finalized = true LIMIT 100`,
    ));

    // Benchmark 2: Find claims by confidence score (leaderboard query)
    results.push(await this.benchmarkQuery(
      'Find high confidence claims',
      `SELECT * FROM claims WHERE "confidenceScore" > 0.8 ORDER BY "confidenceScore" DESC LIMIT 50`,
    ));

    // Benchmark 3: Find stakes by claim ID
    results.push(await this.benchmarkQuery(
      'Find stakes for specific claim',
      `SELECT * FROM stake WHERE "claimId" = (SELECT id FROM claims LIMIT 1)`,
    ));

    // Benchmark 4: Find stakes by wallet address
    results.push(await this.benchmarkQuery(
      'Find stakes by wallet address',
      `SELECT * FROM stake WHERE "walletAddress" LIKE '0x%' LIMIT 100`,
    ));

    // Benchmark 5: Aggregate stakes by claim
    results.push(await this.benchmarkQuery(
      'Aggregate stakes by claim',
      `SELECT "claimId", COUNT(*) as stake_count, SUM(CAST(amount AS NUMERIC)) as total_amount 
       FROM stake 
       GROUP BY "claimId" 
       LIMIT 50`,
    ));

    // Benchmark 6: Find recent stake events
    results.push(await this.benchmarkQuery(
      'Find recent stake events',
      `SELECT * FROM stake_event ORDER BY timestamp DESC LIMIT 100`,
    ));

    // Benchmark 7: Find stake events by claim
    results.push(await this.benchmarkQuery(
      'Find stake events for claim',
      `SELECT * FROM stake_event WHERE "claimId" = (SELECT id FROM claims LIMIT 1)`,
    ));

    // Benchmark 8: Find disputes by claim
    results.push(await this.benchmarkQuery(
      'Find disputes for claim',
      `SELECT * FROM disputes WHERE "claimId" = (SELECT id FROM claims LIMIT 1)`,
    ));

    // Benchmark 9: Find open disputes
    results.push(await this.benchmarkQuery(
      'Find open disputes',
      `SELECT * FROM disputes WHERE status = 'OPEN' ORDER BY "createdAt" DESC LIMIT 50`,
    ));

    // Benchmark 10: Leaderboard query - top reward earners
    results.push(await this.benchmarkQuery(
      'Top reward earners leaderboard',
      `SELECT "walletAddress", SUM(CAST(amount AS NUMERIC)) as total_rewards, COUNT(*) as claim_count
       FROM reward_claims 
       GROUP BY "walletAddress" 
       ORDER BY total_rewards DESC 
       LIMIT 100`,
    ));

    // Benchmark 11: Recent rewards by wallet
    results.push(await this.benchmarkQuery(
      'Recent rewards by wallet',
      `SELECT * FROM reward_claims 
       WHERE "walletAddress" LIKE '0x%' 
       ORDER BY "blockTimestamp" DESC 
       LIMIT 50`,
    ));

    // Benchmark 12: Complex join query - claims with stakes
    results.push(await this.benchmarkQuery(
      'Claims with stake aggregation',
      `SELECT c.id, c."confidenceScore", COUNT(s.id) as stake_count, SUM(CAST(s.amount AS NUMERIC)) as total_staked
       FROM claims c
       LEFT JOIN stake s ON c.id = s."claimId"
       WHERE c.finalized = true
       GROUP BY c.id, c."confidenceScore"
       ORDER BY c."confidenceScore" DESC
       LIMIT 50`,
    ));

    return results;
  }

  private async benchmarkQuery(
    description: string,
    query: string,
  ): Promise<BenchmarkResult> {
    console.log(`📊 Benchmarking: ${description}`);
    
    try {
      // Get query execution plan
      const explainQuery = `EXPLAIN (FORMAT JSON, ANALYZE) ${query}`;
      let explainPlan;
      
      try {
        const explainResult = await this.dataSource.query(explainQuery);
        explainPlan = explainResult[0]['QUERY PLAN'];
      } catch (error) {
        console.log(`   ⚠️  Could not get execution plan: ${error.message}`);
      }

      // Measure execution time
      const startTime = performance.now();
      const result = await this.dataSource.query(query);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;
      const rowsReturned = Array.isArray(result) ? result.length : 0;

      console.log(`   ✅ Completed in ${executionTime.toFixed(2)}ms (${rowsReturned} rows)\n`);

      return {
        query,
        description,
        executionTime,
        rowsReturned,
        explainPlan,
      };
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
      return {
        query,
        description,
        executionTime: -1,
        rowsReturned: 0,
      };
    }
  }

  printResults(results: BenchmarkResult[]): void {
    console.log('\n' + '='.repeat(80));
    console.log('📈 BENCHMARK RESULTS SUMMARY');
    console.log('='.repeat(80) + '\n');

    const successfulResults = results.filter(r => r.executionTime >= 0);
    const totalTime = successfulResults.reduce((sum, r) => sum + r.executionTime, 0);
    const avgTime = totalTime / successfulResults.length;

    console.log(`Total Queries: ${results.length}`);
    console.log(`Successful: ${successfulResults.length}`);
    console.log(`Failed: ${results.length - successfulResults.length}`);
    console.log(`Total Execution Time: ${totalTime.toFixed(2)}ms`);
    console.log(`Average Execution Time: ${avgTime.toFixed(2)}ms\n`);

    console.log('Query Performance:');
    console.log('-'.repeat(80));
    
    successfulResults
      .sort((a, b) => b.executionTime - a.executionTime)
      .forEach((result, index) => {
        const status = result.executionTime < 10 ? '🟢' : 
                      result.executionTime < 50 ? '🟡' : '🔴';
        console.log(`${status} ${index + 1}. ${result.description}`);
        console.log(`   Time: ${result.executionTime.toFixed(2)}ms | Rows: ${result.rowsReturned}`);
      });

    console.log('\n' + '='.repeat(80));
  }

  async saveResults(results: BenchmarkResult[], filename: string): Promise<void> {
    const fs = require('fs');
    const path = require('path');
    
    const outputDir = path.join(process.cwd(), 'benchmark-results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, filename);
    const output = {
      timestamp: new Date().toISOString(),
      results,
      summary: {
        totalQueries: results.length,
        successful: results.filter(r => r.executionTime >= 0).length,
        totalTime: results.reduce((sum, r) => r.executionTime >= 0 ? sum + r.executionTime : sum, 0),
        avgTime: results.reduce((sum, r) => r.executionTime >= 0 ? sum + r.executionTime : sum, 0) / 
                 results.filter(r => r.executionTime >= 0).length,
      },
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\n💾 Results saved to: ${outputPath}`);
  }
}

// CLI execution
async function main() {
  const { dataSource } = await import('../src/config/data-source');
  
  try {
    await dataSource.initialize();
    console.log('✅ Database connection established\n');

    const benchmark = new IndexBenchmark(dataSource);
    const results = await benchmark.runBenchmark();
    
    benchmark.printResults(results);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await benchmark.saveResults(results, `benchmark-${timestamp}.json`);

  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  main();
}
