import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { projectState } from './state/project-state';

interface Feature {
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

interface Page {
  features: Feature[];
}

interface ProjectDefinition {
  pages: {
    [key: string]: Page;
  };
}

export class MilestoneTracker {
  private readonly logPath: string;

  constructor() {
    this.logPath = path.join(process.cwd(), 'logs', 'milestones.log');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  async start(): Promise<void> {
    try {
      console.log(chalk.blue('\n🎯 Starting Milestone Tracker\n'));
      await this.trackMilestones();
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Failed to start milestone tracker:'), error.message);
        throw error;
      }
    }
  }

  private async trackMilestones(): Promise<void> {
    const report = this.generateReport();
    this.logMilestone(report);
    console.log(report);
  }

  private generateReport(): string {
    let report = chalk.blue('\n📊 Milestone Report\n\n');

    const features = this.collectFeatureStats();
    report += `Total Features: ${features.total}\n`;
    report += `Completed: ${features.completed}\n`;
    report += `In Progress: ${features.inProgress}\n`;
    report += `Pending: ${features.pending}\n\n`;

    return report;
  }

  private collectFeatureStats(): { total: number; completed: number; inProgress: number; pending: number } {
    const stats = {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
    };

    const state = projectState.getState();
    const activeFeatures = state.activeFeatures || [];

    activeFeatures.forEach(feature => {
      stats.total++;
      if (feature.includes('completed:')) {
        stats.completed++;
      } else if (feature.includes('in-progress:')) {
        stats.inProgress++;
      } else {
        stats.pending++;
      }
    });

    return stats;
  }

  private logMilestone(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(this.logPath, logMessage);
  }
} 