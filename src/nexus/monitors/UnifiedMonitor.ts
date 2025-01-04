import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EventEmitter } from 'events';

interface SystemState {
  needsAttention: boolean;
  expenses: {
    status: 'healthy' | 'warning' | 'error';
    pendingCount: number;
    lastSync: string | null;
  };
  receipts: {
    status: 'healthy' | 'warning' | 'error';
    unmatchedCount: number;
    processingCount: number;
  };
  email: {
    status: 'healthy' | 'warning' | 'error';
    unprocessedCount: number;
    connected: boolean;
  };
  security: {
    status: 'healthy' | 'warning' | 'error';
    lastCheck: string;
    issues: string[];
  };
  performance: {
    status: 'healthy' | 'warning' | 'error';
    apiLatency: number;
    errorRate: number;
  };
}

interface Anomaly {
  type: string;
  severity: 'low' | 'medium' | 'high';
  details: any;
}

export class UnifiedMonitor extends EventEmitter {
  private supabase: SupabaseClient;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  public async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    await this.checkAllSystems();

    // Set up continuous monitoring
    this.monitoringInterval = setInterval(async () => {
      await this.checkAllSystems();
    }, 30000); // Check every 30 seconds
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
  }

  public async checkAllSystems(): Promise<SystemState> {
    try {
      const [
        expensesState,
        receiptsState,
        emailState,
        securityState,
        performanceState
      ] = await Promise.all([
        this.checkExpenses(),
        this.checkReceipts(),
        this.checkEmail(),
        this.checkSecurity(),
        this.checkPerformance()
      ]);

      const systemState: SystemState = {
        needsAttention: false,
        expenses: expensesState,
        receipts: receiptsState,
        email: emailState,
        security: securityState,
        performance: performanceState
      };

      // Check if system needs attention
      systemState.needsAttention = this.evaluateSystemState(systemState);

      // Emit state update
      this.emit('state-updated', systemState);

      // Check for anomalies
      const anomalies = this.detectAnomalies(systemState);
      if (anomalies.length > 0) {
        anomalies.forEach(anomaly => {
          this.emit('anomaly-detected', anomaly);
        });
      }

      return systemState;
    } catch (error) {
      console.error('Error checking systems:', error);
      throw error;
    }
  }

  private async checkExpenses(): Promise<SystemState['expenses']> {
    try {
      const { data: transactions } = await this.supabase
        .from('transactions')
        .select('status, updated_at')
        .eq('status', 'pending');

      const pendingCount = transactions?.length || 0;
      const lastSync = transactions?.[0]?.updated_at || null;

      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      if (pendingCount > 100) {
        status = 'error';
      } else if (pendingCount > 50) {
        status = 'warning';
      }

      return {
        status,
        pendingCount,
        lastSync
      };
    } catch (error) {
      console.error('Error checking expenses:', error);
      return {
        status: 'error',
        pendingCount: 0,
        lastSync: null
      };
    }
  }

  private async checkReceipts(): Promise<SystemState['receipts']> {
    try {
      const { data: receipts } = await this.supabase
        .from('receipts')
        .select('status');

      const unmatchedCount = receipts?.filter(r => r.status === 'unmatched').length || 0;
      const processingCount = receipts?.filter(r => r.status === 'processing').length || 0;

      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      if (unmatchedCount > 50 || processingCount > 20) {
        status = 'error';
      } else if (unmatchedCount > 20 || processingCount > 10) {
        status = 'warning';
      }

      return {
        status,
        unmatchedCount,
        processingCount
      };
    } catch (error) {
      console.error('Error checking receipts:', error);
      return {
        status: 'error',
        unmatchedCount: 0,
        processingCount: 0
      };
    }
  }

  private async checkEmail(): Promise<SystemState['email']> {
    try {
      const { data: settings } = await this.supabase
        .from('settings')
        .select('*')
        .eq('key', 'gmail_connection')
        .single();

      const { data: emails } = await this.supabase
        .from('emails')
        .select('status')
        .eq('status', 'unprocessed');

      const connected = settings?.value?.connected || false;
      const unprocessedCount = emails?.length || 0;

      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      if (!connected) {
        status = 'error';
      } else if (unprocessedCount > 50) {
        status = 'warning';
      }

      return {
        status,
        connected,
        unprocessedCount
      };
    } catch (error) {
      console.error('Error checking email:', error);
      return {
        status: 'error',
        connected: false,
        unprocessedCount: 0
      };
    }
  }

  private async checkSecurity(): Promise<SystemState['security']> {
    try {
      const issues: string[] = [];

      // Check for suspicious activities
      const { data: suspiciousActivities } = await this.supabase
        .from('security_logs')
        .select('*')
        .eq('type', 'suspicious')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60000).toISOString());

      if (suspiciousActivities && suspiciousActivities.length > 0) {
        issues.push(`${suspiciousActivities.length} suspicious activities detected`);
      }

      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      if (issues.length > 5) {
        status = 'error';
      } else if (issues.length > 0) {
        status = 'warning';
      }

      return {
        status,
        lastCheck: new Date().toISOString(),
        issues
      };
    } catch (error) {
      console.error('Error checking security:', error);
      return {
        status: 'error',
        lastCheck: new Date().toISOString(),
        issues: ['Failed to check security status']
      };
    }
  }

  private async checkPerformance(): Promise<SystemState['performance']> {
    try {
      // Measure API latency
      const start = Date.now();
      await this.supabase.from('health_checks').select('count').limit(1);
      const apiLatency = Date.now() - start;

      // Check error rate
      const { data: errors } = await this.supabase
        .from('error_logs')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 5 * 60000).toISOString());

      const errorRate = (errors?.length || 0) / 5; // Errors per minute

      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      if (apiLatency > 1000 || errorRate > 10) {
        status = 'error';
      } else if (apiLatency > 500 || errorRate > 5) {
        status = 'warning';
      }

      return {
        status,
        apiLatency,
        errorRate
      };
    } catch (error) {
      console.error('Error checking performance:', error);
      return {
        status: 'error',
        apiLatency: -1,
        errorRate: -1
      };
    }
  }

  private evaluateSystemState(state: SystemState): boolean {
    return (
      state.expenses.status === 'error' ||
      state.receipts.status === 'error' ||
      state.email.status === 'error' ||
      state.security.status === 'error' ||
      state.performance.status === 'error' ||
      (state.expenses.status === 'warning' && state.receipts.status === 'warning') ||
      (state.email.status === 'warning' && state.security.status === 'warning')
    );
  }

  private detectAnomalies(state: SystemState): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Check for expense anomalies
    if (state.expenses.pendingCount > 100) {
      anomalies.push({
        type: 'expenses',
        severity: 'high',
        details: {
          pendingCount: state.expenses.pendingCount,
          threshold: 100
        }
      });
    }

    // Check for receipt anomalies
    if (state.receipts.unmatchedCount > 50) {
      anomalies.push({
        type: 'receipts',
        severity: 'medium',
        details: {
          unmatchedCount: state.receipts.unmatchedCount,
          threshold: 50
        }
      });
    }

    // Check for email anomalies
    if (!state.email.connected) {
      anomalies.push({
        type: 'email',
        severity: 'high',
        details: {
          status: 'disconnected'
        }
      });
    }

    // Check for security anomalies
    if (state.security.issues.length > 0) {
      anomalies.push({
        type: 'security',
        severity: 'high',
        details: {
          issues: state.security.issues
        }
      });
    }

    // Check for performance anomalies
    if (state.performance.apiLatency > 1000) {
      anomalies.push({
        type: 'performance',
        severity: 'medium',
        details: {
          apiLatency: state.performance.apiLatency,
          threshold: 1000
        }
      });
    }

    return anomalies;
  }
} 