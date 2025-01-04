import { UnifiedMonitor } from './monitor/UnifiedMonitor';
import { NexusAutoFix } from './auto-fix/NexusAutoFix';
import { NexusCoordinator } from './coordinator/NexusCoordinator';
import { EventEmitter } from 'events';
import chalk from 'chalk';

interface SystemAlert {
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    details?: any;
}

interface SystemState {
    monitor: any;
    autoFix: any;
    coordinator: any;
    running: boolean;
}

export class NexusMaster extends EventEmitter {
    private monitor: UnifiedMonitor;
    private autoFix: NexusAutoFix;
    private coordinator: NexusCoordinator;
    private isRunning: boolean = false;

    constructor() {
        super();
        this.monitor = new UnifiedMonitor();
        this.autoFix = new NexusAutoFix();
        this.coordinator = new NexusCoordinator();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Monitor events
        this.monitor.on('stateUpdate', (state) => {
            this.emit('state-update', state);
        });

        this.monitor.on('anomalyDetected', async (anomaly) => {
            this.emit('alert', this.convertAnomalyToAlert(anomaly));
            if (anomaly.severity === 'high') {
                await this.handleHighSeverityAlert(anomaly);
            }
        });

        // Auto-fix events
        this.autoFix.on('fixApplied', (fix) => {
            this.emit('fix-applied', fix);
        });

        // Coordinator events
        this.coordinator.on('instruction-processed', (result) => {
            this.emit('instruction-processed', result);
        });
    }

    async start(): Promise<void> {
        console.log(chalk.blue('\n🚀 Starting Nexus Master System...\n'));

        try {
            this.isRunning = true;

            // Start monitoring
            await this.monitor.startMonitoring();

            // Set up periodic health checks
            this.startHealthChecks();

            console.log(chalk.green('\n✨ Nexus Master System running\n'));
        } catch (error) {
            console.error(chalk.red('\n❌ Failed to start Nexus Master System:', error));
            this.isRunning = false;
            throw error;
        }
    }

    async stop(): Promise<void> {
        console.log(chalk.blue('\n🛑 Stopping Nexus Master System...\n'));
        
        try {
            this.isRunning = false;
            await this.monitor.stopMonitoring();
            
            console.log(chalk.green('\n✨ Nexus Master System stopped\n'));
        } catch (error) {
            console.error(chalk.red('\n❌ Error stopping Nexus Master System:', error));
            throw error;
        }
    }

    private startHealthChecks(): void {
        if (!this.isRunning) return;

        setInterval(async () => {
            try {
                await this.monitor.checkAllSystems();
            } catch (error) {
                console.error(chalk.red('Health check failed:', error));
            }
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    private async handleHighSeverityAlert(anomaly: any): Promise<void> {
        console.log(chalk.red('\n🚨 High severity alert detected:', anomaly));

        try {
            // Try auto-fix
            await this.triggerAutoFix();

            // Get AI analysis
            await this.coordinator.processInstruction(`Analyze and fix the following anomaly: ${JSON.stringify(anomaly)}`);

            // Verify system state after fix
            await this.monitor.checkAllSystems();
        } catch (error) {
            console.error(chalk.red('Failed to handle high severity alert:', error));
            this.emit('error', error);
        }
    }

    private async triggerAutoFix(): Promise<void> {
        try {
            console.log(chalk.blue('\n🔧 Triggering auto-fix...'));
            
            // Run auto-fix
            await this.autoFix.runAutoFix();
            
            console.log(chalk.green('Auto-fix completed successfully'));
        } catch (error) {
            console.error(chalk.red('Auto-fix failed:', error));
            this.emit('error', error);
        }
    }

    private convertAnomalyToAlert(anomaly: any): SystemAlert {
        return {
            type: anomaly.type,
            severity: anomaly.severity,
            message: `${anomaly.type} anomaly detected`,
            details: anomaly.details
        };
    }

    // Public API
    async getSystemStatus(): Promise<SystemState> {
        return {
            monitor: await this.monitor.checkAllSystems(),
            autoFix: this.autoFix.getState?.() || {},
            coordinator: await this.coordinator.getProjectStatus(),
            running: this.isRunning
        };
    }

    async runDiagnostics(): Promise<void> {
        if (!this.isRunning) {
            throw new Error('System not running');
        }

        await this.monitor.checkAllSystems();
        await this.autoFix.runAutoFix();
        await this.coordinator.processInstruction('Run system diagnostics and report status');
    }

    async processInstruction(instruction: string): Promise<void> {
        if (!this.isRunning) {
            throw new Error('System not running');
        }

        await this.coordinator.processInstruction(instruction);
    }
}

export {
    UnifiedMonitor,
    NexusAutoFix,
    NexusCoordinator
}; 