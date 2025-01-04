import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { Command } from 'commander';
import { DevelopmentDashboard } from './dashboard';
import { stateSync } from './sync-manager';
import { sessionManager } from './session-state';
import { MilestoneTracker } from './milestone-tracker';
import { MilestoneNotifier } from './notifications/milestone-notifications';
import { MilestoneAutomation } from './automation/milestone-automation';
import { NexusBrain } from './nexus-brain';
import { GitHooksManager } from './hooks/git-hooks';
import { projectState } from './state/project-state';

interface CommandOptions {
  force?: boolean;
  debug?: boolean;
  sync?: boolean;
}

class NexusManager {
  private readonly dashboard: DevelopmentDashboard;
  private readonly brain: NexusBrain;
  private readonly hooks: GitHooksManager;
  private readonly milestoneTracker: MilestoneTracker;
  private readonly milestoneNotifier: MilestoneNotifier;
  private readonly milestoneAutomation: MilestoneAutomation;

  constructor() {
    this.dashboard = new DevelopmentDashboard();
    this.brain = new NexusBrain();
    this.hooks = new GitHooksManager();
    this.milestoneTracker = new MilestoneTracker();
    this.milestoneNotifier = new MilestoneNotifier();
    this.milestoneAutomation = new MilestoneAutomation();
  }

  async initialize(): Promise<void> {
    try {
      // Start state sync
      stateSync.start();

      // Initialize dashboard
      await this.dashboard.initialize();

      // Initialize git hooks
      await this.hooks.initialize();

      // Start milestone tracking
      await this.milestoneTracker.start();
      await this.milestoneNotifier.start();
      await this.milestoneAutomation.start();

      console.log(chalk.green('\n✨ Nexus initialized successfully\n'));
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('\n❌ Failed to initialize Nexus:'), error.message);
        process.exit(1);
      }
    }
  }

  async handleCommand(command: string, options: CommandOptions = {}): Promise<void> {
    try {
      const result = await this.brain.processCommand(command, options);
      console.log(chalk.cyan('\n🤖 Nexus response:'), result);
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('\n❌ Command failed:'), error.message);
      }
    }
  }
}

// Create Nexus instance
const nexus = new NexusManager();

// Set up CLI
const program = new Command();

program
  .name('nexus')
  .description('AI-powered development assistant')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize Nexus')
  .action(async () => {
    await nexus.initialize();
  });

program
  .command('run <command>')
  .description('Execute a Nexus command')
  .option('-f, --force', 'Force execution')
  .option('-d, --debug', 'Enable debug mode')
  .option('-s, --sync', 'Sync state after execution')
  .action(async (command: string, options: CommandOptions) => {
    await nexus.handleCommand(command, options);
  });

// Parse command line arguments
program.parse(process.argv); 