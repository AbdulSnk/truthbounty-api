import * as fs from 'fs';
import * as path from 'path';

interface BenchmarkResult {
  query: string;
  description: string;
  executionTime: number;
  rowsReturned: number;
}

interface BenchmarkFile {
  timestamp: string;
  results: BenchmarkResult[];
  summary: {
    totalQueries: number;
    successful: number;
    totalTime: number;
    avgTime: number;
  };
}

/**
 * Compare two benchmark results to show performance improvements
 */
class BenchmarkComparator {
  compareFiles(beforeFile: string, afterFile: string): void {
    const before = this.loadBenchmark(beforeFile);
    const after = this.loadBenchmark(afterFile);

    if (!before || !after) {
      console.error('❌ Could not load benchmark files');
      return;
    }

    this.printComparison(before, after);
  }

  private loadBenchmark(filename: string): BenchmarkFile | null {
    try {
      const filePath = path.join(process.cwd(), 'benchmark-results', filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error loading ${filename}:`, error.message);
      return null;
    }
  }

  private printComparison(before: BenchmarkFile, after: BenchmarkFile): void {
    console.log('\n' + '='.repeat(100));
    console.log('📊 BENCHMARK COMPARISON REPORT');
    console.log('='.repeat(100) + '\n');

    console.log(`Before: ${before.timestamp}`);
    console.log(`After:  ${after.timestamp}\n`);

    // Overall summary
    console.log('Overall Performance:');
    console.log('-'.repeat(100));
    
    const totalTimeDiff = after.summary.totalTime - before.summary.totalTime;
    const totalTimePercent = ((totalTimeDiff / before.summary.totalTime) * 100);
    const avgTimeDiff = after.summary.avgTime - before.summary.avgTime;
    const avgTimePercent = ((avgTimeDiff / before.summary.avgTime) * 100);

    console.log(`Total Execution Time: ${before.summary.totalTime.toFixed(2)}ms → ${after.summary.totalTime.toFixed(2)}ms`);
    console.log(`  ${this.formatChange(totalTimeDiff, totalTimePercent)}`);
    
    console.log(`\nAverage Execution Time: ${before.summary.avgTime.toFixed(2)}ms → ${after.summary.avgTime.toFixed(2)}ms`);
    console.log(`  ${this.formatChange(avgTimeDiff, avgTimePercent)}`);

    // Individual query comparison
    console.log('\n\nIndividual Query Performance:');
    console.log('-'.repeat(100));
    console.log(
      `${'Query'.padEnd(50)} | ${'Before'.padStart(10)} | ${'After'.padStart(10)} | ${'Change'.padStart(15)}`
    );
    console.log('-'.repeat(100));

    const improvements: Array<{ description: string; improvement: number }> = [];

    before.results.forEach((beforeResult) => {
      const afterResult = after.results.find(
        (r) => r.description === beforeResult.description
      );

      if (!afterResult || beforeResult.executionTime < 0 || afterResult.executionTime < 0) {
        return;
      }

      const diff = afterResult.executionTime - beforeResult.executionTime;
      const percent = ((diff / beforeResult.executionTime) * 100);

      const description = beforeResult.description.substring(0, 48);
      const beforeTime = `${beforeResult.executionTime.toFixed(2)}ms`;
      const afterTime = `${afterResult.executionTime.toFixed(2)}ms`;
      const change = this.formatChange(diff, percent, false);

      console.log(
        `${description.padEnd(50)} | ${beforeTime.padStart(10)} | ${afterTime.padStart(10)} | ${change.padStart(15)}`
      );

      if (percent < 0) {
        improvements.push({
          description: beforeResult.description,
          improvement: Math.abs(percent),
        });
      }
    });

    // Top improvements
    if (improvements.length > 0) {
      console.log('\n\nTop Performance Improvements:');
      console.log('-'.repeat(100));
      
      improvements
        .sort((a, b) => b.improvement - a.improvement)
        .slice(0, 5)
        .forEach((item, index) => {
          console.log(`${index + 1}. ${item.description}`);
          console.log(`   🚀 ${item.improvement.toFixed(1)}% faster\n`);
        });
    }

    // Performance rating
    console.log('\n' + '='.repeat(100));
    this.printPerformanceRating(avgTimePercent);
    console.log('='.repeat(100) + '\n');
  }

  private formatChange(diff: number, percent: number, includeEmoji: boolean = true): string {
    const emoji = includeEmoji
      ? diff < 0
        ? '🟢'
        : diff > 0
        ? '🔴'
        : '⚪'
      : '';
    
    const sign = diff > 0 ? '+' : '';
    const percentStr = `${sign}${percent.toFixed(1)}%`;
    const diffStr = `${sign}${diff.toFixed(2)}ms`;
    
    return `${emoji} ${diffStr} (${percentStr})`;
  }

  private printPerformanceRating(avgTimePercent: number): void {
    console.log('Performance Rating:');
    
    if (avgTimePercent < -50) {
      console.log('🌟🌟🌟 EXCELLENT - Queries are significantly faster!');
    } else if (avgTimePercent < -25) {
      console.log('🌟🌟 GREAT - Substantial performance improvement!');
    } else if (avgTimePercent < -10) {
      console.log('🌟 GOOD - Noticeable performance improvement');
    } else if (avgTimePercent < 0) {
      console.log('✅ IMPROVED - Slight performance improvement');
    } else if (avgTimePercent < 10) {
      console.log('⚠️  NEUTRAL - Minimal performance change');
    } else {
      console.log('❌ DEGRADED - Performance has decreased');
    }
  }

  listAvailableBenchmarks(): string[] {
    const resultsDir = path.join(process.cwd(), 'benchmark-results');
    
    if (!fs.existsSync(resultsDir)) {
      console.log('No benchmark results directory found');
      return [];
    }

    const files = fs.readdirSync(resultsDir)
      .filter(f => f.startsWith('benchmark-') && f.endsWith('.json'))
      .sort();

    return files;
  }
}

// CLI execution
async function main() {
  const comparator = new BenchmarkComparator();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('📁 Available benchmark files:\n');
    const files = comparator.listAvailableBenchmarks();
    
    if (files.length === 0) {
      console.log('No benchmark files found. Run "npm run benchmark:indexes" first.');
      return;
    }

    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file}`);
    });

    console.log('\nUsage: npm run benchmark:compare <before-file> <after-file>');
    console.log('Example: npm run benchmark:compare benchmark-2024-01-01.json benchmark-2024-01-02.json');
    return;
  }

  if (args.length !== 2) {
    console.error('❌ Please provide exactly two benchmark files to compare');
    console.log('Usage: npm run benchmark:compare <before-file> <after-file>');
    return;
  }

  const [beforeFile, afterFile] = args;
  comparator.compareFiles(beforeFile, afterFile);
}

if (require.main === module) {
  main();
}

export { BenchmarkComparator };
