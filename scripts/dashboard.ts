import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { projectState } from './state/project-state';
import { sessionManager } from './session-state';

interface DashboardConfig {
  refreshInterval: number;
  logPath: string;
}

export class DevelopmentDashboard {
  private config: DashboardConfig;
  private refreshIntervalId?: NodeJS.Timeout;
  private isRunning: boolean = false;

  constructor() {
    this.config = {
      refreshInterval: 5000, // 5 seconds
      logPath: path.join(process.cwd(), 'logs', 'dashboard.log'),
    };
  }

  async initialize(): Promise<void> {
    try {
      // Ensure log directory exists
      const logDir = path.dirname(this.config.logPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      console.log(chalk.blue('\n📊 Initializing Development Dashboard\n'));
      this.logStatus('Dashboard initialized');
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Failed to initialize dashboard:'), error.message);
        throw error;
      }
    }
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Dashboard is already running');
      return;
    }

    try {
      this.isRunning = true;
      console.log('Starting development dashboard...');
      // Add initialization logic here
    } catch (error) {
      this.isRunning = false;
      throw error;
    }
  }

  stop(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
    console.log(chalk.yellow('\n👋 Dashboard stopped\n'));
  }

  private refresh(): void {
    this.displayStatus();
    this.logStatus('Dashboard refreshed');
  }

  private displayStatus(): void {
    const state = projectState.getState();
    const context = sessionManager.getCurrentContext();

    console.clear();
    console.log(chalk.blue('\n📊 Development Dashboard\n'));

    // Project Status
    console.log(chalk.yellow('Project Status:'));
    console.log(`Active Features: ${state.activeFeatures.length}`);
    console.log(`Scripts Status: ${JSON.stringify(state.scripts, null, 2)}`);

    // Session Status
    console.log(chalk.yellow('\nSession Status:'));
    console.log(`Current Task: ${context.currentTask || 'None'}`);
    console.log(`Pending Tasks: ${context.pendingTasks.length}`);

    // Errors
    if (state.errors.length > 0) {
      console.log(chalk.red('\nErrors:'));
      state.errors.forEach(error => console.log(`- ${error}`));
    }
  }

  private logStatus(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(this.config.logPath, logMessage);
  }
} 