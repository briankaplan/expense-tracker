import * as fs from 'fs';
import * as path from 'path';

interface ProjectState {
  activeFeatures: string[];
  scripts: {
    total: number;
    active: number;
    outdated: number;
    missing: number;
  };
  errors: string[];
}

class ProjectStateManager {
  private state: ProjectState;
  private readonly statePath: string;

  constructor() {
    this.statePath = path.join(process.cwd(), '.project-state.json');
    this.state = this.loadState();
  }

  private loadState(): ProjectState {
    try {
      if (fs.existsSync(this.statePath)) {
        return JSON.parse(fs.readFileSync(this.statePath, 'utf8'));
      }
    } catch (error) {
      console.error('Failed to load project state:', error);
    }

    return {
      activeFeatures: [],
      scripts: {
        total: 0,
        active: 0,
        outdated: 0,
        missing: 0,
      },
      errors: [],
    };
  }

  saveState(): void {
    try {
      fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error('Failed to save project state:', error);
    }
  }

  getState(): ProjectState {
    return { ...this.state };
  }

  updateState(updates: Partial<ProjectState>): void {
    this.state = { ...this.state, ...updates };
    this.saveState();
  }

  addError(error: string): void {
    this.state.errors.push(error);
    this.saveState();
  }

  clearErrors(): void {
    this.state.errors = [];
    this.saveState();
  }
}

export const projectState = new ProjectStateManager();
export type { ProjectState }; 