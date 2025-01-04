import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

interface SessionContext {
  currentTask?: string;
  lastCommand?: string;
  pendingTasks: string[];
  lastAISuggestion?: string;
  pendingAISuggestions: string[];
  lastSync?: string;
}

interface SessionState {
  currentContext: SessionContext;
  history: {
    command: string;
    timestamp: string;
  }[];
}

export class SessionManager {
  private state: SessionState;
  private readonly statePath: string;

  constructor() {
    this.statePath = path.join(process.cwd(), '.session-state.json');
    this.state = this.loadState();
  }

  private loadState(): SessionState {
    try {
      if (fs.existsSync(this.statePath)) {
        return JSON.parse(fs.readFileSync(this.statePath, 'utf8'));
      }
    } catch (error) {
      console.error(chalk.red('Failed to load session state:'), error);
    }

    return {
      currentContext: {
        pendingTasks: [],
        pendingAISuggestions: [],
      },
      history: [],
    };
  }

  saveState(): void {
    try {
      fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error(chalk.red('Failed to save session state:'), error);
    }
  }

  getState(): SessionState {
    return { ...this.state };
  }

  getCurrentContext(): SessionContext {
    return { ...this.state.currentContext };
  }

  updateState(updates: Partial<SessionState>): void {
    this.state = { ...this.state, ...updates };
    this.saveState();
  }

  addHistoryEntry(command: string): void {
    this.state.history.push({
      command,
      timestamp: new Date().toISOString(),
    });
    this.saveState();
  }

  clearHistory(): void {
    this.state.history = [];
    this.saveState();
  }
}

export const sessionManager = new SessionManager();
export type { SessionState, SessionContext }; 