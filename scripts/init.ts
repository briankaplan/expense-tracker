import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { PROJECT_DEFINITION } from './project-roadmap';
import { GitHooksManager } from './hooks/git-hooks';

export const REQUIRED_DIRS = [
  'scripts/state',
  'scripts/ai',
  'scripts/automation',
  'scripts/notifications',
  'backups',
  'logs',
  'recovery'
];

export const REQUIRED_FILES = [
  '.project-state.json',
  '.session-state.json'
];

export const DEFAULT_STATE = {
  projectState: {
    lastUpdated: new Date().toISOString(),
    currentPhase: 'initialization',
    projectDefinition: PROJECT_DEFINITION,
    verificationHistory: [],
    integrations: {}
  },
  sessionState: {
    timestamp: new Date().toISOString(),
    currentContext: {
      lastCommand: '',
      activeFeature: '',
      pendingChanges: [],
      recentFiles: [],
      currentErrors: []
    },
    projectState: {
      phase: 'initialization',
      completedFeatures: [],
      inProgressFeatures: [],
      pendingFeatures: [],
      criticalPaths: []
    },
    developmentContext: {
      recentDecisions: [],
      architectureChanges: [],
      technicalDebt: []
    }
  }
};

export interface InitializationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

export async function initialize(): Promise<InitializationResult> {
  const result: InitializationResult = {
    success: true,
    errors: [],
    warnings: []
  };

  try {
    // Create required directories
    REQUIRED_DIRS.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Create required files with default state
    REQUIRED_FILES.forEach(file => {
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify(DEFAULT_STATE, null, 2));
      }
    });

    // Initialize Git hooks
    const hooksManager = new GitHooksManager();
    await hooksManager.initialize();

    console.log(chalk.green('✓ Project initialized successfully'));
  } catch (error) {
    result.success = false;
    result.errors.push(error.message);
    console.error(chalk.red('✗ Project initialization failed:'), error.message);
  }

  return result;
}

// Run if called directly
if (require.main === module) {
  console.log(chalk.blue('\n🚀 Initializing Nexus Development System\n'));
  
  initialize()
    .then(() => {
      console.log(chalk.green('\n✨ Nexus system initialized successfully!\n'));
      console.log('Try these commands:');
      console.log(chalk.yellow('npm run n help') + ' - Show all commands');
      console.log(chalk.yellow('npm run n d') + ' - Open dashboard');
      console.log(chalk.yellow('npm run n ai resume') + ' - Get AI assistance');
    })
    .catch(error => {
      console.error(chalk.red('\n❌ Initialization failed:'), error);
      process.exit(1);
    });
} 