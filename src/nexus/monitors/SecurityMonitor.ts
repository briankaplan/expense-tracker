import { execSync } from 'child_process';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { SecurityMetrics, AnomalyDetection } from '../types/metrics';

export class SecurityMonitor {
  private checksums: Map<string, string> = new Map();
  private anomalyThresholds: Map<string, number> = new Map();

  constructor() {
    this.initializeThresholds();
  }

  private initializeThresholds(): void {
    this.anomalyThresholds.set('unauthorizedAccess', 0);
    this.anomalyThresholds.set('criticalVulnerabilities', 0);
    this.anomalyThresholds.set('modifiedFiles', 0);
  }

  async collectMetrics(): Promise<SecurityMetrics> {
    const fileIntegrity = await this.checkFileIntegrity();
    const vulnerabilities = await this.checkVulnerabilities();

    return {
      lastBackup: new Date().toISOString(),
      fileIntegrity,
      unauthorizedAccess: await this.checkAccessAttempts(),
      vulnerabilities
    };
  }

  async detectAnomalies(metrics: SecurityMetrics): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = [];

    // Check critical vulnerabilities
    if (metrics.vulnerabilities.critical > this.anomalyThresholds.get('criticalVulnerabilities')!) {
      anomalies.push({
        type: 'security',
        severity: 'high',
        message: 'Critical security vulnerabilities detected',
        suggestion: 'Run npm audit fix and update affected dependencies immediately',
        context: { vulnerabilities: metrics.vulnerabilities }
      });
    }

    // Check unauthorized access attempts
    if (metrics.unauthorizedAccess > this.anomalyThresholds.get('unauthorizedAccess')!) {
      anomalies.push({
        type: 'security',
        severity: 'high',
        message: 'Unauthorized access attempts detected',
        suggestion: 'Review access logs and strengthen authentication mechanisms',
        context: { attempts: metrics.unauthorizedAccess }
      });
    }

    // Check file modifications
    if (metrics.fileIntegrity.modified > this.anomalyThresholds.get('modifiedFiles')!) {
      anomalies.push({
        type: 'security',
        severity: 'medium',
        message: 'Protected files have been modified',
        suggestion: 'Review file changes and verify integrity',
        context: { modified: metrics.fileIntegrity.modified }
      });
    }

    return anomalies;
  }

  private async checkFileIntegrity(): Promise<{ total: number; modified: number; protected: number }> {
    const protectedFiles = await this.getProtectedFiles();
    let modified = 0;
    let protected_ = 0;

    for (const file of protectedFiles) {
      const currentChecksum = await this.calculateChecksum(file);
      const storedChecksum = this.checksums.get(file);

      if (storedChecksum && currentChecksum !== storedChecksum) {
        modified++;
      } else {
        protected_++;
      }

      // Update checksum
      this.checksums.set(file, currentChecksum);
    }

    return {
      total: protectedFiles.length,
      modified,
      protected: protected_
    };
  }

  private async getProtectedFiles(): Promise<string[]> {
    return [
      '.env',
      '.env.local',
      'package.json',
      'package-lock.json',
      'next.config.js',
      'tsconfig.json',
      '.eslintrc.json',
      'src/nexus/config.ts'
    ];
  }

  private async calculateChecksum(file: string): Promise<string> {
    try {
      const content = await fs.readFile(file);
      return crypto.createHash('sha256').update(content).digest('hex');
    } catch (error) {
      console.error(`Error calculating checksum for ${file}:`, error);
      return '';
    }
  }

  private async checkVulnerabilities(): Promise<{ critical: number; high: number; moderate: number }> {
    try {
      const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(auditOutput);
      
      return {
        critical: audit.metadata.vulnerabilities.critical,
        high: audit.metadata.vulnerabilities.high,
        moderate: audit.metadata.vulnerabilities.moderate
      };
    } catch (error) {
      return { critical: 0, high: 0, moderate: 0 };
    }
  }

  private async checkAccessAttempts(): Promise<number> {
    try {
      // In a real implementation, this would check access logs
      // For now, return a simulated value
      return 0;
    } catch (error) {
      return 0;
    }
  }
} 