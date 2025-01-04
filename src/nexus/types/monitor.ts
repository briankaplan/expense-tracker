export interface SystemState {
  expenses: {
    tellerStatus: 'connected' | 'disconnected' | 'error';
    pendingSync: number;
    lastSync: string;
  };
  receipts: {
    ocrQueue: number;
    unmatchedCount: number;
    backupStatus: 'up-to-date' | 'pending' | 'error';
  };
  integrations: {
    gmail: {
      status: 'connected' | 'disconnected';
      unprocessedEmails: number;
    };
    sms: {
      status: 'active' | 'inactive';
      pendingReceipts: number;
    };
    dropbox: {
      status: 'connected' | 'disconnected';
      lastBackup: string;
    };
  };
  performance: {
    apiLatency: number;
    databaseConnections: number;
    errorRate: number;
  };
  security: {
    lastCheck: string;
    activeThreats: number;
    fileIntegrity: 'valid' | 'compromised';
  };
}

export interface MonitorUpdate {
  type: 'expenses' | 'receipts' | 'integrations' | 'performance' | 'security';
  data: Partial<SystemState>;
  timestamp: string;
}

export interface DatabaseStats {
  connections: number;
  error_rate: number;
  query_performance: {
    avg_query_time: number;
    slow_queries: number;
  };
} 