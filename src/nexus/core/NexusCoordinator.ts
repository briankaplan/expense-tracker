import { OpenAI } from 'openai';
import chalk from 'chalk';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import _ from 'lodash';
import { EventEmitter } from 'events';
import {
  AIMemory,
  StateGuard,
  CoordinatorConfig,
  ActionPlan,
  SystemStateVerification
} from '../types/coordinator';

export class NexusCoordinator extends EventEmitter {
  private openai: OpenAI;
  private memory: AIMemory;
  private stateGuard: StateGuard;
  private config: CoordinatorConfig;
  private gitBackupTimer: NodeJS.Timer | null = null;
  private stateCheckTimer: NodeJS.Timer | null = null;

  constructor(config?: Partial<CoordinatorConfig>) {
    super();
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Set configuration
    this.config = {
      gitBackupInterval: 5 * 60 * 1000, // 5 minutes
      stateCheckInterval: 60 * 1000, // 1 minute
      memoryFile: '.nexus/memory.json',
      stateFile: '.nexus/state-guard.json',
      ...config
    };
  }

  async start(): Promise<void> {
    console.log(chalk.blue('\n🚀 Starting Nexus Coordinator...'));

    try {
      // Initialize system
      await this.initializeSystem();

      // Start monitoring
      this.startMonitoring();

      console.log(chalk.green('\n✨ Nexus Coordinator started successfully!'));
    } catch (error) {
      console.error(chalk.red('\n❌ Failed to start Nexus Coordinator:'), error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    console.log(chalk.blue('\n🛑 Stopping Nexus Coordinator...'));

    try {
      // Stop timers
      if (this.gitBackupTimer) clearInterval(this.gitBackupTimer);
      if (this.stateCheckTimer) clearInterval(this.stateCheckTimer);

      // Save final state
      await this.saveMemory();
      await this.saveStateGuard();

      console.log(chalk.green('\n✨ Nexus Coordinator stopped successfully!'));
    } catch (error) {
      console.error(chalk.red('\n❌ Failed to stop Nexus Coordinator:'), error);
      throw error;
    }
  }

  async processHumanInput(input: string): Promise<void> {
    console.log(chalk.blue('\n🧠 Processing human input...'));

    try {
      // Analyze input with AI
      const understanding = await this.analyzeInput(input);

      // Plan actions
      const plannedActions = await this.planActions(understanding);

      // Update memory
      this.memory.humanInteractions.push({
        timestamp: new Date().toISOString(),
        input,
        understanding,
        plannedActions
      });

      // Save memory
      await this.saveMemory();

      // Execute planned actions
      await this.executeActions(plannedActions);

      this.emit('input-processed', {
        input,
        understanding,
        actions: plannedActions
      });
    } catch (error) {
      console.error(chalk.red('Error processing input:', error));
      this.emit('error', error);
      throw error;
    }
  }

  private async initializeSystem(): Promise<void> {
    // Load or initialize AI memory
    this.memory = await this.loadMemory();
    
    // Initialize state guard
    this.stateGuard = await this.initializeStateGuard();

    // Verify system state
    await this.verifySystemState();
  }

  private startMonitoring(): void {
    // Start Git backup timer
    this.gitBackupTimer = setInterval(
      () => this.performGitBackup(),
      this.config.gitBackupInterval
    );

    // Start state check timer
    this.stateCheckTimer = setInterval(
      () => this.checkSystemState(),
      this.config.stateCheckInterval
    );
  }

  private async analyzeInput(input: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a development coordinator. Analyze the human input and provide a structured understanding of the requirements and implications.'
        },
        {
          role: 'user',
          content: `Analyze this development request: ${input}\nContext: ${JSON.stringify(this.memory.currentContext)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || '';
  }

  private async planActions(understanding: string): Promise<string[]> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Based on the understanding of the request, plan specific development actions.'
        },
        {
          role: 'user',
          content: `Create action plan for: ${understanding}\nCurrent project state: ${JSON.stringify(this.memory.projectState)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return JSON.parse(response.choices[0]?.message?.content || '[]');
  }

  private async executeActions(actions: string[]): Promise<void> {
    for (const action of actions) {
      try {
        // Verify state before action
        await this.verifySystemState();

        // Execute action
        await this.executeAction(action);

        // Verify state after action
        await this.verifySystemState();

        // Update memory
        this.memory.projectState.developmentHistory.push({
          timestamp: new Date().toISOString(),
          action,
          result: 'completed'
        });

        // Save state
        await this.saveMemory();
        await this.performGitBackup();

        this.emit('action-completed', { action });
      } catch (error) {
        console.error(chalk.red(`Error executing action ${action}:`), error);
        this.emit('action-failed', { action, error });
        throw error;
      }
    }
  }

  private async executeAction(action: string): Promise<void> {
    // Add action execution logic
    console.log(chalk.yellow(`Executing action: ${action}`));
    // Implementation will depend on the specific action type
  }

  private async verifySystemState(): Promise<SystemStateVerification> {
    console.log(chalk.blue('\n🔍 Verifying system state...'));

    const verification: SystemStateVerification = {
      packageIntegrity: true,
      moduleState: true,
      gitState: true,
      buildState: true,
      lastVerified: new Date().toISOString(),
      issues: []
    };

    try {
      // Check package.json integrity
      const currentPackageHash = await this.calculateFileHash('package-lock.json');
      if (currentPackageHash !== this.stateGuard.packageLock) {
        verification.packageIntegrity = false;
        verification.issues.push('Package lock mismatch');
        await this.restorePackageState();
      }

      // Check node_modules
      const currentModules = await this.getNodeModulesState();
      if (!_.isEqual(currentModules, this.stateGuard.nodeModules)) {
        verification.moduleState = false;
        verification.issues.push('Node modules state mismatch');
        await this.restoreNodeModules();
      }

      // Update state guard
      this.stateGuard = {
        ...this.stateGuard,
        timestamp: new Date().toISOString(),
        packageLock: currentPackageHash,
        nodeModules: currentModules,
        gitHash: await this.getCurrentGitHash()
      };

      await this.saveStateGuard();
    } catch (error) {
      console.error(chalk.red('Error verifying system state:'), error);
      verification.issues.push(`Verification error: ${error.message}`);
      throw error;
    }

    return verification;
  }

  private async restorePackageState(): Promise<void> {
    console.log(chalk.yellow('Restoring package state...'));
    
    try {
      // Get last known good state from git
      const lastGoodHash = this.stateGuard.gitHash;
      execSync(`git checkout ${lastGoodHash} package.json package-lock.json`);
      execSync('npm install');
      
      this.emit('state-restored', { type: 'package' });
    } catch (error) {
      console.error(chalk.red('Failed to restore package state:'), error);
      this.emit('restore-failed', { type: 'package', error });
      throw error;
    }
  }

  private async restoreNodeModules(): Promise<void> {
    console.log(chalk.yellow('Restoring node_modules...'));
    
    try {
      await fs.rm('node_modules', { recursive: true, force: true });
      execSync('npm ci');
      
      this.emit('state-restored', { type: 'modules' });
    } catch (error) {
      console.error(chalk.red('Failed to restore node_modules:'), error);
      this.emit('restore-failed', { type: 'modules', error });
      throw error;
    }
  }

  private async performGitBackup(): Promise<void> {
    console.log(chalk.blue('\n💾 Performing Git backup...'));

    try {
      // Create .nexus directory if it doesn't exist
      await fs.mkdir('.nexus', { recursive: true });

      // Save current state
      await this.saveMemory();
      await this.saveStateGuard();

      // Commit and push changes
      execSync('git add .');
      execSync(`git commit -m "Nexus Auto-backup: ${new Date().toISOString()}"`);
      execSync('git push');

      this.emit('backup-completed');
    } catch (error) {
      console.error(chalk.red('Error performing backup:'), error);
      this.emit('backup-failed', error);
    }
  }

  private async checkSystemState(): Promise<void> {
    try {
      const verification = await this.verifySystemState();
      
      this.memory.systemHealth = {
        packageIntegrity: verification.packageIntegrity,
        moduleState: verification.moduleState,
        lastVerified: verification.lastVerified
      };

      await this.saveMemory();

      if (verification.issues.length > 0) {
        this.emit('state-issues', verification.issues);
      }
    } catch (error) {
      console.error(chalk.red('Error checking system state:'), error);
      this.emit('check-failed', error);
    }
  }

  // Utility methods
  private async calculateFileHash(file: string): Promise<string> {
    const crypto = await import('crypto');
    const content = await fs.readFile(file);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private async getNodeModulesState(): Promise<string[]> {
    if (!existsSync('node_modules')) return [];
    
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    return Object.keys(dependencies).sort();
  }

  private async getCurrentGitHash(): Promise<string> {
    return execSync('git rev-parse HEAD').toString().trim();
  }

  private async loadMemory(): Promise<AIMemory> {
    try {
      if (existsSync(this.config.memoryFile)) {
        return JSON.parse(await fs.readFile(this.config.memoryFile, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading memory:'), error);
    }

    return this.getInitialMemory();
  }

  private getInitialMemory(): AIMemory {
    return {
      currentContext: {
        task: '',
        progress: 0,
        startTime: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      },
      projectState: {
        lastKnownGoodState: {
          packageHash: '',
          nodeModulesHash: '',
          timestamp: new Date().toISOString()
        },
        developmentHistory: [],
        completedFeatures: [],
        plannedFeatures: []
      },
      humanInteractions: [],
      systemHealth: {
        packageIntegrity: true,
        moduleState: true,
        lastVerified: new Date().toISOString()
      }
    };
  }

  private async initializeStateGuard(): Promise<StateGuard> {
    try {
      if (existsSync(this.config.stateFile)) {
        return JSON.parse(await fs.readFile(this.config.stateFile, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading state guard:'), error);
    }

    return {
      timestamp: new Date().toISOString(),
      packageLock: await this.calculateFileHash('package-lock.json'),
      nodeModules: await this.getNodeModulesState(),
      gitHash: await this.getCurrentGitHash(),
      lastGoodBuild: ''
    };
  }

  private async saveMemory(): Promise<void> {
    await fs.mkdir(path.dirname(this.config.memoryFile), { recursive: true });
    await fs.writeFile(this.config.memoryFile, JSON.stringify(this.memory, null, 2));
  }

  private async saveStateGuard(): Promise<void> {
    await fs.mkdir(path.dirname(this.config.stateFile), { recursive: true });
    await fs.writeFile(this.config.stateFile, JSON.stringify(this.stateGuard, null, 2));
  }
} 