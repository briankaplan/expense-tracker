import { OpenAI } from 'openai';
import chalk from 'chalk';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { EventEmitter } from 'events';
import { SystemState, SubsystemStatus, SecurityConfig, NexusEvent } from '../types/master';
import { UnifiedMonitor } from './UnifiedMonitor';
import { AutoFixSystem } from './AutoFixSystem';
import { NexusCoordinator } from './NexusCoordinator';

export class NexusMaster extends EventEmitter {
  private monitor: UnifiedMonitor;
  private autoFix: AutoFixSystem;
  private coordinator: NexusCoordinator;
  private openai: OpenAI;
  private state: SystemState;
  private subsystemStatus: Map<string, SubsystemStatus>;
  private readonly STATE_FILE = '.nexus/master-state.json';
  private readonly LOG_FILE = '.nexus/master.log';
  private monitoringInterval: NodeJS.Timer | null = null;
  
  constructor() {
    super();
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Initialize subsystems
    this.monitor = new UnifiedMonitor();
    this.autoFix = new AutoFixSystem();
    this.coordinator = new NexusCoordinator();
    
    // Initialize status tracking
    this.subsystemStatus = new Map();
    
    // Initialize state
    this.state = this.getInitialState();
    
    // Set up event listeners
    this.setupEventListeners();
  }

  private getInitialState(): SystemState {
    return {
      monitorState: {
        lastCheck: new Date().toISOString(),
        status: 'inactive',
        metrics: {}
      },
      coordinatorState: {
        lastAction: '',
        pendingTasks: 0,
        activeProcesses: []
      },
      autoFixState: {
        lastFix: new Date().toISOString(),
        fixesApplied: 0,
        pendingFixes: []
      },
      securityState: {
        lastScan: new Date().toISOString(),
        threats: 0,
        integrityStatus: 'valid'
      }
    };
  }

  private setupEventListeners(): void {
    // Monitor events
    this.monitor.on('state-update', this.handleMonitorUpdate.bind(this));
    this.monitor.on('error', this.handleSubsystemError.bind(this, 'monitor'));

    // AutoFix events
    this.autoFix.on('fix-applied', this.handleFixApplied.bind(this));
    this.autoFix.on('error', this.handleSubsystemError.bind(this, 'autofix'));

    // Coordinator events
    this.coordinator.on('task-complete', this.handleTaskComplete.bind(this));
    this.coordinator.on('error', this.handleSubsystemError.bind(this, 'coordinator'));
  }

  async start(): Promise<void> {
    console.log(chalk.blue('\n🚀 Starting Nexus Master System...\n'));

    try {
      // Load previous state if exists
      await this.loadState();

      // Start subsystems
      await this.startSubsystems();

      // Initialize security measures
      await this.initializeSecurity();

      // Start monitoring
      this.startMonitoring();

      console.log(chalk.green('\n✨ Nexus Master System started successfully!\n'));
    } catch (error) {
      console.error(chalk.red('\n❌ Failed to start Nexus Master System:'), error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    console.log(chalk.blue('\n🛑 Stopping Nexus Master System...\n'));

    try {
      // Stop monitoring
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
      }

      // Stop subsystems
      await Promise.all([
        this.monitor.stopMonitoring(),
        this.coordinator.stop(),
        this.saveState()
      ]);

      console.log(chalk.green('\n✨ Nexus Master System stopped successfully!\n'));
    } catch (error) {
      console.error(chalk.red('\n❌ Failed to stop Nexus Master System:'), error);
      throw error;
    }
  }

  private async startSubsystems(): Promise<void> {
    try {
      // Start monitor
      await this.monitor.startMonitoring();
      this.updateSubsystemStatus('monitor', true);

      // Start coordinator
      await this.coordinator.start();
      this.updateSubsystemStatus('coordinator', true);

      // Initialize AutoFix
      await this.autoFix.initialize();
      this.updateSubsystemStatus('autofix', true);
    } catch (error) {
      console.error(chalk.red('Failed to start subsystems:'), error);
      throw error;
    }
  }

  private async initializeSecurity(): Promise<void> {
    try {
      // Verify file integrity
      await this.verifyFileIntegrity();

      // Check for security updates
      await this.checkSecurityUpdates();

      // Initialize backup system
      await this.initializeBackup();

      this.state.securityState.lastScan = new Date().toISOString();
      await this.saveState();
    } catch (error) {
      console.error(chalk.red('Failed to initialize security:'), error);
      throw error;
    }
  }

  private startMonitoring(): void {
    // Perform initial check
    this.checkSystem();

    // Start periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.checkSystem();
    }, 60000); // Check every minute
  }

  private async checkSystem(): Promise<void> {
    try {
      // Update system state
      this.state.monitorState.lastCheck = new Date().toISOString();
      this.state.monitorState.status = 'active';

      // Check subsystem health
      await this.checkSubsystemHealth();

      // Save current state
      await this.saveState();

      // Emit system check event
      this.emit('system-check', {
        timestamp: new Date().toISOString(),
        state: this.state
      });
    } catch (error) {
      console.error(chalk.red('System check failed:'), error);
      this.emit('error', error);
    }
  }

  private async checkSubsystemHealth(): Promise<void> {
    for (const [subsystem, status] of this.subsystemStatus.entries()) {
      if (!status.active) {
        console.warn(chalk.yellow(`⚠️ Subsystem ${subsystem} is inactive`));
        await this.attemptSubsystemRecovery(subsystem);
      }
    }
  }

  private async attemptSubsystemRecovery(subsystem: string): Promise<void> {
    try {
      switch (subsystem) {
        case 'monitor':
          await this.monitor.startMonitoring();
          break;
        case 'coordinator':
          await this.coordinator.start();
          break;
        case 'autofix':
          await this.autoFix.initialize();
          break;
      }
      this.updateSubsystemStatus(subsystem, true);
    } catch (error) {
      console.error(chalk.red(`Failed to recover ${subsystem}:`), error);
      this.emit('recovery-failed', { subsystem, error });
    }
  }

  private updateSubsystemStatus(subsystem: string, active: boolean, error?: string): void {
    this.subsystemStatus.set(subsystem, {
      active,
      lastUpdate: new Date().toISOString(),
      error
    });
  }

  private async loadState(): Promise<void> {
    try {
      if (existsSync(this.STATE_FILE)) {
        const data = await fs.readFile(this.STATE_FILE, 'utf8');
        this.state = JSON.parse(data);
      }
    } catch (error) {
      console.error(chalk.red('Failed to load state:'), error);
      // Continue with initial state
    }
  }

  private async saveState(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.STATE_FILE), { recursive: true });
      await fs.writeFile(this.STATE_FILE, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error(chalk.red('Failed to save state:'), error);
    }
  }

  // Event handlers
  private handleMonitorUpdate(update: any): void {
    this.state.monitorState.metrics = update;
    this.emit('state-update', { type: 'monitor', data: update });
  }

  private handleFixApplied(fix: any): void {
    this.state.autoFixState.fixesApplied++;
    this.state.autoFixState.lastFix = new Date().toISOString();
    this.emit('fix-applied', fix);
  }

  private handleTaskComplete(task: any): void {
    this.state.coordinatorState.pendingTasks--;
    this.state.coordinatorState.lastAction = task.action;
    this.emit('task-complete', task);
  }

  private handleSubsystemError(subsystem: string, error: Error): void {
    this.updateSubsystemStatus(subsystem, false, error.message);
    this.emit('subsystem-error', { subsystem, error });
  }

  // Security methods
  private async verifyFileIntegrity(): Promise<void> {
    try {
      execSync('npm run verify:all', { stdio: 'pipe' });
      this.state.securityState.integrityStatus = 'valid';
    } catch (error) {
      this.state.securityState.integrityStatus = 'compromised';
      throw error;
    }
  }

  private async checkSecurityUpdates(): Promise<void> {
    try {
      execSync('npm audit', { stdio: 'pipe' });
    } catch (error) {
      console.warn(chalk.yellow('Security vulnerabilities found:'), error);
      this.state.securityState.threats++;
    }
  }

  private async initializeBackup(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.STATE_FILE), { recursive: true });
      // Additional backup initialization logic
    } catch (error) {
      console.error(chalk.red('Failed to initialize backup:'), error);
      throw error;
    }
  }

  // Public methods
  getState(): SystemState {
    return this.state;
  }

  getSubsystemStatus(subsystem: string): SubsystemStatus | undefined {
    return this.subsystemStatus.get(subsystem);
  }

  async runDiagnostics(): Promise<Record<string, any>> {
    // Run system diagnostics
    return {
      state: this.state,
      subsystems: Object.fromEntries(this.subsystemStatus),
      timestamp: new Date().toISOString()
    };
  }
} 