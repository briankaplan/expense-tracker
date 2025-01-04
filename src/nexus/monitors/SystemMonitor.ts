import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import _ from 'lodash';
import { SystemMetrics, AnomalyDetection } from '../types/metrics';

export class SystemMonitor {
  private metricsHistory: Map<string, any[]> = new Map();
  private anomalyThresholds: Map<string, number> = new Map();

  constructor() {
    this.initializeThresholds();
  }

  private initializeThresholds(): void {
    this.anomalyThresholds.set('buildTime', 120000); // 2 minutes
    this.anomalyThresholds.set('bundleSize', 5000000); // 5MB
    this.anomalyThresholds.set('testCoverage', 80); // 80% coverage
  }

  async collectMetrics(): Promise<SystemMetrics> {
    // Measure build time
    const buildStart = Date.now();
    execSync('npm run build', { stdio: 'pipe' });
    const buildTime = Date.now() - buildStart;

    // Analyze bundle size
    const buildDir = path.join(process.cwd(), '.next');
    const bundleSize = await this.calculateBundleSize(buildDir);

    // Check dependencies
    const dependencies = await this.analyzeDependencies();

    const metrics: SystemMetrics = {
      buildTime,
      bundleSize,
      testCoverage: await this.calculateTestCoverage(),
      dependencies,
      performance: {
        timeToFirstBuild: buildTime,
        averageBuildTime: this.calculateAverageBuildTime(buildTime),
        bundleLoadTime: await this.measureBundleLoadTime()
      }
    };

    this.updateHistory('system', metrics);
    return metrics;
  }

  async detectAnomalies(metrics: SystemMetrics): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = [];

    // Check build time
    if (metrics.buildTime > this.anomalyThresholds.get('buildTime')!) {
      anomalies.push({
        type: 'performance',
        severity: 'high',
        message: 'Build time exceeded threshold',
        suggestion: 'Consider optimizing build configuration or splitting bundles',
        context: { current: metrics.buildTime, threshold: this.anomalyThresholds.get('buildTime') }
      });
    }

    // Check bundle size
    if (metrics.bundleSize > this.anomalyThresholds.get('bundleSize')!) {
      anomalies.push({
        type: 'performance',
        severity: 'medium',
        message: 'Bundle size exceeded threshold',
        suggestion: 'Consider code splitting or removing unused dependencies',
        context: { current: metrics.bundleSize, threshold: this.anomalyThresholds.get('bundleSize') }
      });
    }

    // Check test coverage
    if (metrics.testCoverage < this.anomalyThresholds.get('testCoverage')!) {
      anomalies.push({
        type: 'quality',
        severity: 'medium',
        message: 'Test coverage below threshold',
        suggestion: 'Add more test cases to improve coverage',
        context: { current: metrics.testCoverage, threshold: this.anomalyThresholds.get('testCoverage') }
      });
    }

    return anomalies;
  }

  private async calculateBundleSize(dir: string): Promise<number> {
    let totalSize = 0;
    try {
      const files = await fs.readdir(dir, { withFileTypes: true });

      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          totalSize += await this.calculateBundleSize(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      console.error('Error calculating bundle size:', error);
    }

    return totalSize;
  }

  private async analyzeDependencies(): Promise<{ total: number; outdated: number; vulnerable: number }> {
    try {
      const outdatedOutput = execSync('npm outdated --json', { encoding: 'utf8' });
      const outdated = Object.keys(JSON.parse(outdatedOutput || '{}')).length;

      const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(auditOutput);
      const vulnerable = audit.metadata.vulnerabilities.total;

      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const total = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies }).length;

      return { total, outdated, vulnerable };
    } catch (error) {
      return { total: 0, outdated: 0, vulnerable: 0 };
    }
  }

  private calculateAverageBuildTime(currentBuildTime: number): number {
    const buildTimes = this.metricsHistory.get('buildTime') || [];
    return _.mean([...buildTimes.map(b => b.value), currentBuildTime]);
  }

  private async measureBundleLoadTime(): Promise<number> {
    // In a real implementation, this would measure actual bundle load time
    // For now, return a simulated value
    return Math.random() * 1000; // Simulated load time between 0-1000ms
  }

  private async calculateTestCoverage(): Promise<number> {
    try {
      execSync('npm test -- --coverage', { stdio: 'pipe' });
      const coverageFile = path.join(process.cwd(), 'coverage', 'coverage-final.json');
      const coverage = JSON.parse(await fs.readFile(coverageFile, 'utf8'));
      return _.mean(Object.values(coverage).map((file: any) => file.coverage));
    } catch {
      return 0;
    }
  }

  private updateHistory(metric: string, value: any): void {
    if (!this.metricsHistory.has(metric)) {
      this.metricsHistory.set(metric, []);
    }

    const history = this.metricsHistory.get(metric)!;
    history.push({
      timestamp: new Date().toISOString(),
      value
    });

    // Keep last 100 entries
    if (history.length > 100) {
      history.shift();
    }
  }
} 