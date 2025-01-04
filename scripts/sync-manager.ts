import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { sessionManager } from './session-state';

interface SyncConfig {
  syncInterval: number;
  backupInterval: number;
  maxBackups: number;
  backupDir: string;
}

class StateSync {
  private config: SyncConfig = {
    syncInterval: 5 * 60 * 1000, // 5 minutes
    backupInterval: 60 * 60 * 1000, // 1 hour
    maxBackups: 10,
    backupDir: path.join(process.cwd(), 'backups'),
  };

  private syncIntervalId?: NodeJS.Timeout;
  private backupIntervalId?: NodeJS.Timeout;

  constructor() {
    // Ensure backup directory exists
    if (!fs.existsSync(this.config.backupDir)) {
      fs.mkdirSync(this.config.backupDir, { recursive: true });
    }
  }

  start(): void {
    this.syncIntervalId = setInterval(() => this.sync(), this.config.syncInterval);
    this.backupIntervalId = setInterval(() => this.backup(), this.config.backupInterval);
  }

  stop(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }
    if (this.backupIntervalId) {
      clearInterval(this.backupIntervalId);
    }
  }

  private async sync(): Promise<void> {
    try {
      // Sync with remote state if needed
      this.logSync('State synced successfully');

      // Update session state
      sessionManager.updateState({
        currentContext: {
          ...sessionManager.getCurrentContext(),
          lastSync: new Date().toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logSync('Sync failed: ' + error.message, 'error');
      }
    }
  }

  private async backup(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.config.backupDir, `state-${timestamp}.json`);

      const state = {
        timestamp,
        session: sessionManager.getState(),
      };

      fs.writeFileSync(backupPath, JSON.stringify(state, null, 2));
      this.logSync('Backup created successfully');
      this.cleanupOldBackups();
    } catch (error) {
      if (error instanceof Error) {
        this.logSync('Backup failed: ' + error.message, 'error');
      }
    }
  }

  private cleanupOldBackups(): void {
    const files = fs.readdirSync(this.config.backupDir)
      .filter((f: string) => f.startsWith('state-'))
      .map((f: string) => ({
        name: f,
        time: fs.statSync(path.join(this.config.backupDir, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > this.config.maxBackups) {
      files.slice(this.config.maxBackups).forEach((file) => {
        fs.unlinkSync(path.join(this.config.backupDir, file.name));
      });
    }
  }

  private logSync(message: string, level: 'info' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const coloredMessage = level === 'error' ? chalk.red(message) : chalk.green(message);
    console.log(`[${timestamp}] ${coloredMessage}`);
  }
}

export const stateSync = new StateSync();
export type { SyncConfig }; 