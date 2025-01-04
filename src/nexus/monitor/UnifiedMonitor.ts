import { EventEmitter } from 'events';
import { createClient } from '@supabase/supabase-js';

interface SystemState {
    expenses: {
        status: 'healthy' | 'warning' | 'error';
        pendingTransactions: number;
    };
    receipts: {
        status: 'healthy' | 'warning' | 'error';
        unmatchedReceipts: number;
        processingReceipts: number;
    };
    email: {
        status: 'connected' | 'disconnected' | 'error';
        lastSyncTime?: Date;
    };
    security: {
        status: 'secure' | 'warning' | 'breach';
        lastAuditTime: Date;
    };
    performance: {
        status: 'optimal' | 'degraded' | 'poor';
        responseTime: number;
        errorRate: number;
    };
}

interface Anomaly {
    type: string;
    severity: 'low' | 'medium' | 'high';
    details: any;
    timestamp: Date;
}

export class UnifiedMonitor extends EventEmitter {
    private supabase;
    private currentState: SystemState;
    private monitoringInterval: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_ANON_KEY!
        );
        this.currentState = this.getInitialState();
    }

    private getInitialState(): SystemState {
        return {
            expenses: {
                status: 'healthy',
                pendingTransactions: 0
            },
            receipts: {
                status: 'healthy',
                unmatchedReceipts: 0,
                processingReceipts: 0
            },
            email: {
                status: 'disconnected'
            },
            security: {
                status: 'secure',
                lastAuditTime: new Date()
            },
            performance: {
                status: 'optimal',
                responseTime: 0,
                errorRate: 0
            }
        };
    }

    async startMonitoring(): Promise<void> {
        console.log('Starting system monitoring...');
        
        // Perform initial check
        await this.checkAllSystems();
        
        // Set up continuous monitoring
        this.monitoringInterval = setInterval(async () => {
            await this.checkAllSystems();
        }, 30000); // Check every 30 seconds
    }

    async stopMonitoring(): Promise<void> {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    private async checkAllSystems(): Promise<void> {
        const newState = { ...this.currentState };

        // Check expenses
        const expensesState = await this.checkExpenses();
        newState.expenses = expensesState;

        // Check receipts
        const receiptsState = await this.checkReceipts();
        newState.receipts = receiptsState;

        // Check email integration
        const emailState = await this.checkEmailIntegration();
        newState.email = emailState;

        // Check security
        const securityState = await this.checkSecurity();
        newState.security = securityState;

        // Check performance
        const performanceState = await this.checkPerformance();
        newState.performance = performanceState;

        // Emit state update
        this.emit('stateUpdate', newState);

        // Check for anomalies
        this.detectAnomalies(newState);

        // Update current state
        this.currentState = newState;
    }

    private async checkExpenses(): Promise<SystemState['expenses']> {
        try {
            const { data, error } = await this.supabase
                .from('expenses')
                .select('status')
                .eq('status', 'pending');

            if (error) throw error;

            return {
                status: 'healthy',
                pendingTransactions: data?.length || 0
            };
        } catch (error) {
            return {
                status: 'error',
                pendingTransactions: 0
            };
        }
    }

    private async checkReceipts(): Promise<SystemState['receipts']> {
        try {
            const { data: unmatched, error: unmatchedError } = await this.supabase
                .from('receipts')
                .select('id')
                .eq('status', 'unmatched');

            const { data: processing, error: processingError } = await this.supabase
                .from('receipts')
                .select('id')
                .eq('status', 'processing');

            if (unmatchedError || processingError) throw unmatchedError || processingError;

            return {
                status: 'healthy',
                unmatchedReceipts: unmatched?.length || 0,
                processingReceipts: processing?.length || 0
            };
        } catch (error) {
            return {
                status: 'error',
                unmatchedReceipts: 0,
                processingReceipts: 0
            };
        }
    }

    private async checkEmailIntegration(): Promise<SystemState['email']> {
        try {
            // Implement email integration check logic
            return {
                status: 'connected',
                lastSyncTime: new Date()
            };
        } catch (error) {
            return {
                status: 'disconnected'
            };
        }
    }

    private async checkSecurity(): Promise<SystemState['security']> {
        try {
            // Implement security check logic
            return {
                status: 'secure',
                lastAuditTime: new Date()
            };
        } catch (error) {
            return {
                status: 'warning',
                lastAuditTime: new Date()
            };
        }
    }

    private async checkPerformance(): Promise<SystemState['performance']> {
        try {
            // Implement performance check logic
            return {
                status: 'optimal',
                responseTime: 100,
                errorRate: 0
            };
        } catch (error) {
            return {
                status: 'degraded',
                responseTime: 500,
                errorRate: 0.1
            };
        }
    }

    private detectAnomalies(state: SystemState): void {
        // Check for expense anomalies
        if (state.expenses.status === 'error' || state.expenses.pendingTransactions > 10) {
            this.emitAnomaly('expenses', 'high', state.expenses);
        }

        // Check for receipt anomalies
        if (state.receipts.status === 'error' || state.receipts.unmatchedReceipts > 5) {
            this.emitAnomaly('receipts', 'medium', state.receipts);
        }

        // Check for email integration anomalies
        if (state.email.status === 'disconnected' || state.email.status === 'error') {
            this.emitAnomaly('email', 'high', state.email);
        }

        // Check for security anomalies
        if (state.security.status !== 'secure') {
            this.emitAnomaly('security', 'high', state.security);
        }

        // Check for performance anomalies
        if (state.performance.status !== 'optimal') {
            this.emitAnomaly('performance', 'medium', state.performance);
        }
    }

    private emitAnomaly(type: string, severity: Anomaly['severity'], details: any): void {
        const anomaly: Anomaly = {
            type,
            severity,
            details,
            timestamp: new Date()
        };
        this.emit('anomalyDetected', anomaly);
    }
} 