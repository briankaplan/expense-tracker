const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class StateSync {
  private config: SyncConfig = {
    syncInterval: 30000, // 30 seconds
    backupInterval: 3600000, // 1 hour
    maxBackups: 10
  };

  private backupPath = path.join(process.cwd(), 'backups');
  private syncInterval: NodeJS.Timer;
  private backupInterval: NodeJS.Timer;

  start() {
    console.log(chalk.blue('\n🔄 Starting State Synchronization\n'));

    // Start periodic sync
    this.syncInterval = setInterval(() => {
      this.syncState();
    }, this.config.syncInterval);

    // Start periodic backups
    this.backupInterval = setInterval(() => {
      this.createBackup();
    }, this.config.backupInterval);

    // Initial sync
    this.syncState();
  }

  stop() {
    clearInterval(this.syncInterval);
    clearInterval(this.backupInterval);
  }

  private async syncState() {
    try {
      // Sync git state
      const gitState = this.getGitState();
      
      // Sync project state
      const projectStateData = projectState.getState();
      
      // Update session state
      sessionManager.updateState({
        currentContext: {
          ...sessionManager.getCurrentContext(),
          lastCommand: gitState.lastCommand,
          recentFiles: gitState.recentFiles
        },
        projectState: {
          ...projectStateData,
          phase: this.determineProjectPhase(projectStateData)
        }
      });

      this.logSync('State synchronized successfully');
    } catch (error) {
      this.logSync('Sync failed: ' + error.message, 'error');
    }
  }

  private createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupPath, `state-${timestamp}.json`);

    try {
      // Ensure backup directory exists
      if (!fs.existsSync(this.backupPath)) {
        fs.mkdirSync(this.backupPath, { recursive: true });
      }

      // Create backup
      const state = {
        session: sessionManager.getState(),
        project: projectState.getState()
      };

      fs.writeFileSync(backupFile, JSON.stringify(state, null, 2));

      // Cleanup old backups
      this.cleanupOldBackups();

      this.logSync('Backup created successfully');
    } catch (error) {
      this.logSync('Backup failed: ' + error.message, 'error');
    }
  }

  private cleanupOldBackups() {
    const files = fs.readdirSync(this.backupPath)
      .filter(f => f.startsWith('state-'))
      .map(f => ({
        name: f,
        time: fs.statSync(path.join(this.backupPath, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    // Remove excess backups
    files.slice(this.config.maxBackups).forEach(file => {
      fs.unlinkSync(path.join(this.backupPath, file.name));
    });
  }

  private getGitState() {
    try {
      const lastCommand = execSync('git reflog -n 1').toString().trim();
      const recentFiles = execSync('git diff --name-only HEAD~1').toString().split('\n').filter(Boolean);
      return { lastCommand, recentFiles };
    } catch (error) {
      return { lastCommand: '', recentFiles: [] };
    }
  }

  private determineProjectPhase(state: any): string {
    // Implement phase determination logic based on project state
    return 'development';
  }

  private logSync(message: string, type: 'info' | 'error' = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    if (type === 'error') {
      console.error(chalk.red(logMessage));
    } else {
      console.log(chalk.green(logMessage));
    }
  }
}

const stateSync = new StateSync();

module.exports = {
  stateSync
}; 