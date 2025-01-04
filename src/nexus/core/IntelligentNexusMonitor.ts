import { OpenAI } from 'openai';
import chalk from 'chalk';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import _ from 'lodash';
import {
  SystemMetrics,
  SecurityMetrics,
  ProjectMetrics,
  AnomalyDetection,
  MetricsHistory
} from '../types/metrics';
import { SecurityMonitor } from '../monitors/SecurityMonitor';
import { SystemMonitor } from '../monitors/SystemMonitor';
import { ProjectMonitor } from '../monitors/ProjectMonitor';
import { AIAnalyzer } from '../services/AIAnalyzer';
import { MetricsStorage } from '../services/MetricsStorage';

export class IntelligentNexusMonitor {
  private openai: OpenAI;
  private securityMonitor: SecurityMonitor;
  private systemMonitor: SystemMonitor;
  private projectMonitor: ProjectMonitor;
  private aiAnalyzer: AIAnalyzer;
  private metricsStorage: MetricsStorage;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.securityMonitor = new SecurityMonitor();
    this.systemMonitor = new SystemMonitor();
    this.projectMonitor = new ProjectMonitor();
    this.aiAnalyzer = new AIAnalyzer(this.openai);
    this.metricsStorage = new MetricsStorage();
  }

  async monitor(): Promise<void> {
    try {
      console.log(chalk.blue('\n🧠 Starting Intelligent Nexus Monitor...\n'));

      // Collect metrics
      const [systemMetrics, securityMetrics, projectMetrics] = await Promise.all([
        this.systemMonitor.collectMetrics(),
        this.securityMonitor.collectMetrics(),
        this.projectMonitor.collectMetrics()
      ]);

      // Detect anomalies
      const anomalies = await this.detectAnomalies({
        ...systemMetrics,
        ...securityMetrics,
        ...projectMetrics
      });

      // Get AI analysis
      const aiAnalysis = await this.aiAnalyzer.analyze({
        metrics: {
          system: systemMetrics,
          security: securityMetrics,
          project: projectMetrics
        },
        anomalies
      });

      // Save metrics
      await this.metricsStorage.saveMetrics({
        timestamp: new Date().toISOString(),
        metrics: {
          system: systemMetrics,
          security: securityMetrics,
          project: projectMetrics
        },
        anomalies,
        analysis: aiAnalysis
      });

      console.log(chalk.green('\n✨ Monitoring completed successfully!\n'));
    } catch (error) {
      console.error(chalk.red('\n❌ Monitoring failed:'), error);
      throw error;
    }
  }

  private async detectAnomalies(metrics: any): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = [];

    // Collect anomalies from each monitor
    const systemAnomalies = await this.systemMonitor.detectAnomalies(metrics);
    const securityAnomalies = await this.securityMonitor.detectAnomalies(metrics);
    const projectAnomalies = await this.projectMonitor.detectAnomalies(metrics);

    return [...systemAnomalies, ...securityAnomalies, ...projectAnomalies];
  }
} 